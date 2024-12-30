import { Component, OnInit, OnDestroy } from '@angular/core';
import { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';
import { environment } from '../../environments/environment';
import { GameState } from './interfaces/game.interface';
import { SOCKET_EVENTS } from '../../constants';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
})
export class GameComponent implements OnInit, OnDestroy {
  private socket: Socket;
  currentPlayerId: string = 'player_' + Math.random().toString(36).substr(2, 9);
  pendingInvite: { gameId: string; from: string; user: any } | null = null;
  activeGameId: string = '';
  isInGame: boolean = false;
  gameState: GameState = {
    board: Array(9).fill(''),
    currentPlayer: 'X',
    winner: null,
    isGameOver: false,
    players: {},
    status: 'waiting',
  };
  soundPlayed: boolean = false;
  onlineUsers: any[] = [];
  private clickSound = new Audio('assets/sounds/click-sound.mp3');
  private tadaSound = new Audio('assets/sounds/tada-sound.mp3');
  private failSound = new Audio('assets/sounds/fail-sound.mp3');
  chatId: string = '';
  enemyId: string = '';
  user: any;
  userWaiting: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private router: Router
  ) {
    this.socket = io(environment.wsUrl);
  }

  async ngOnInit() {
    this.userWaiting = true;
    this.chatId = this.route.snapshot.queryParams['chat_id'];
    this.user = await this.userService.getUser(this.chatId);
    console.log(this.user);
    this.userWaiting = false;
    this.setupSocketListeners();
    this.connectUser();
  }

  ngOnDestroy() {
    this.socket.removeAllListeners();
    this.socket.disconnect();
  }

  makeMove(index: number) {
    if (
      !this.gameState ||
      this.gameState.board[index] ||
      !this.isMyTurn() ||
      this.gameState.isGameOver
    ) {
      return;
    }

    // Update local state immediately for better UX
    this.gameState.board[index] = this.gameState.players[this.currentPlayerId];
    this.clickSound.play();

    // Send move to server
    this.socket.emit(SOCKET_EVENTS.MAKE_MOVE, {
      gameId: this.activeGameId,
      playerId: this.currentPlayerId,
      position: index,
    });
  }

  isMyTurn(): boolean {
    return (
      this.gameState?.currentPlayer === this.currentPlayerId &&
      !this.gameState.isGameOver
    );
  }

  invitePlayer(otherPlayerId: string) {
    this.socket.emit(SOCKET_EVENTS.SEND_GAME_INVITE, {
      from: this.currentPlayerId,
      to: otherPlayerId,
      user: this.user,
    });
  }

  inviteAgain() {
    if (this.enemyId) {
      this.socket.emit(SOCKET_EVENTS.SEND_GAME_INVITE, {
        from: this.currentPlayerId,
        to: this.enemyId,
      });
      this.enemyId = '';
    }
  }

  acceptInvite() {
    if (this.pendingInvite) {
      this.socket.emit(SOCKET_EVENTS.ACCEPT_INVITE, {
        gameId: this.pendingInvite.gameId,
        playerId: this.currentPlayerId,
      });
      this.pendingInvite = null;
    }
  }

  declineInvite() {
    this.pendingInvite = null;
  }

  getAvailablePlayers() {
    return Object.entries(this.gameState.players)
      .filter(([id]) => id !== this.currentPlayerId)
      .map(([id, symbol]) => ({ id, symbol }));
  }

  leaveGame() {
    if (this.isInGame) {
      this.socket.emit(SOCKET_EVENTS.LEAVE_GAME, {
        gameId: this.activeGameId,
        playerId: this.currentPlayerId,
      });
    }
    this.isInGame = false;
    this.gameState = {
      board: Array(9).fill(''),
      currentPlayer: 'X',
      winner: null,
      isGameOver: false,
      players: {},
      status: 'waiting',
    };
    this.activeGameId = '';
    this.router.navigate(['/game'], { queryParams: { chat_id: this.chatId } });
  }

  winner() {
    this.playSound(true);
    return 'You won!';
  }

  loser() {
    this.playSound(false);
    return 'Opponent won!';
  }

  private playSound(winner: boolean) {
    if (!this.soundPlayed) {
      (winner ? this.tadaSound : this.failSound).play();
      this.soundPlayed = true;
    }
  }

  private connectUser() {
    this.socket.emit(SOCKET_EVENTS.USER_CONNECTED, {
      userId: this.currentPlayerId,
      ...this.user,
    });
  }

  private setupSocketListeners() {
    this.socket.on(SOCKET_EVENTS.CONNECT, () => {
      this.connectUser();
    });

    this.socket.on(SOCKET_EVENTS.ONLINE_USERS, (players: any[]) => {
      this.onlineUsers = players.filter(
        (player: any) => player.userId !== this.currentPlayerId
      );
    });

    this.socket.on(
      SOCKET_EVENTS.GAME_INVITE,
      (data: { gameId: string; from: string; user: any }) => {
        this.pendingInvite = data;
      }
    );

    this.socket.on(
      SOCKET_EVENTS.GAME_STARTED,
      (data: GameState & { gameId: string }) => {
        this.gameState = data;
        this.isInGame = true;
        this.activeGameId = data.gameId;
        this.pendingInvite = null;
      }
    );

    this.socket.on(SOCKET_EVENTS.MOVE_MADE, (data: GameState) => {
      this.gameState = data;
    });

    this.socket.on(SOCKET_EVENTS.GAME_ENDED, (data: GameState) => {
      this.gameState = data;
      this.enemyId =
        (Object.keys(this.gameState.players).find(
          (id) => id !== this.currentPlayerId
        ) as string) || '';
    });

    this.socket.on(SOCKET_EVENTS.GAME_ERROR, (data: { message: string }) => {
      console.error(data.message);
      alert(data.message); // Replace with UI notification
    });
  }
}

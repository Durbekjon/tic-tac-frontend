import { Component, OnInit, OnDestroy } from '@angular/core';
import { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';
import { environment } from '../../environments/environment';
import { GameState } from '../interfaces/game.interface';
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
  pendingInvite: { gameId: string; from: string; user: any } | null = null;
  activeGameId: string = '';
  currentPlayerId: string = '';
  isInGame: boolean = false;
  gameState: GameState = {
    board: Array(9).fill(''),
    currentPlayer: 'X',
    winner: null,
    isGameOver: false,
    players: {},
    status: 'waiting',
  };
  onlineUsers: any[] = [];
  chatId: string = '';
  user: any;
  userWaiting: boolean = false;
  sentInvites: string[] = [];
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
    this.userWaiting = false;
    this.currentPlayerId = this.chatId;
    this.setupSocketListeners();
    this.connectUser();
  }

  async ngOnDestroy() {
    await this.socket.removeAllListeners(); // event listenerlarni o'chirib tashlash
    this.handleDisconnect(); // disconnectni amalga oshirish
  }

  private handleDisconnect() {
    if (this.isInGame) {
      this.socket.emit(SOCKET_EVENTS.LEAVE_GAME, {
        gameId: this.activeGameId,
        playerId: this.currentPlayerId,
      });
    }

    this.socket.disconnect(); // Socketni to'xtatish
  }

  playSound(soundType: string) {
    switch (soundType) {
      // case 'win':
      //   const winSound = new Audio('assets/sounds/tada-sound.mp3');
      //   winSound.play();
      //   break;
      // case 'lose':
      //   const loseSound = new Audio('assets/sounds/fail-sound.mp3');
      //   loseSound.play();
      //   break;
      case 'click':
        const clickSound = new Audio('assets/sounds/click-sound.mp3');
        clickSound.play();
        break;
      default:
        break;
    }
  }

  playWithBot() {
    const userId = this.currentPlayerId;
    this.socket.emit(SOCKET_EVENTS.PLAY_WITH_BOT, { userId });
  }

  isPlayingWithBot(): boolean {
    return this.gameState.players['bot'].symbol === 'O';
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
    this.playSound('click');

    this.socket.emit(SOCKET_EVENTS.MAKE_MOVE, {
      gameId: this.activeGameId,
      playerId: this.currentPlayerId,
      position: index,
    });
  }

  getOtherPlayerId() {
    const otherPlayerId = Object.keys(this.gameState.players).find(
      (playerId) => playerId !== this.currentPlayerId
    ) as string;

    return otherPlayerId;
  }

  isMyTurn(): boolean {
    console.log({
      currentPlayer: this.gameState?.currentPlayer,
      currentUser: this.currentPlayerId,
      currentUserSymbol: this.gameState?.players[this.currentPlayerId].symbol,
    });

    return (
      this.gameState?.currentPlayer ===
        this.gameState.players[this.currentPlayerId].symbol &&
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

  acceptInvite() {
    if (this.pendingInvite) {
      this.socket.emit(SOCKET_EVENTS.ACCEPT_INVITE, {
        from: this.pendingInvite.from,
        to: this.currentPlayerId,
      });
      this.pendingInvite = null;
    }
  }

  rejectInvite() {
    this.socket.emit(SOCKET_EVENTS.REJECT_INVITE, {
      from: this.pendingInvite?.from,
      to: this.currentPlayerId,
    });
    this.pendingInvite = null;
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
        (player: any) =>
          player.userId !== this.currentPlayerId && player.firstName
      );
    });

    this.socket.on(SOCKET_EVENTS.INVITE_SENT, (data: any) => {
      this.sentInvites = data;
    });

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
    });

    this.socket.on(SOCKET_EVENTS.GAME_INVITE, (data: any) => {
      this.pendingInvite = data;
    });

    this.socket.on(SOCKET_EVENTS.GAME_ERROR, (data: { message: string }) => {
      alert(data.message); // Replace with UI notification
    });
  }

  winner(): string {
    this.playSound('win');
    return 'Congratulations! you win 🎉️️️️️️';
  }

  loser(): string {
    this.playSound('lose');
    return 'Opponent wins! Better luck next time!';
  }

  inviteAgain() {
    this.socket.emit(SOCKET_EVENTS.SEND_GAME_INVITE, {
      from: this.currentPlayerId,
      to: Object.keys(this.gameState.players).find(
        (playerId) => playerId !== this.currentPlayerId
      ),
      user: this.user,
    });
  }
}

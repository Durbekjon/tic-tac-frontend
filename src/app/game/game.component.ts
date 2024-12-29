import { Component, OnInit, OnDestroy } from '@angular/core';
import { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';
import { environment } from '../../environments/environment';
import { GameState } from './interfaces/game.interface';
import { SOCKET_EVENTS } from '../../constants';
import { Router } from '@angular/router';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
})
export class GameComponent implements OnInit, OnDestroy {
  private socket: Socket;
  currentPlayerId: string = 'player_' + Math.random().toString(36).substr(2, 9);
  pendingInvite: any = null;
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
  onlineUsers: string[] = [];
  protected readonly Object = Object;
  private clickSound = new Audio('assets/sounds/click-sound.mp3');
  private tadaSound = new Audio('assets/sounds/tada-sound.mp3');
  private failSound = new Audio('assets/sounds/fail-sound.mp3');
  private router: Router = new Router;
  enemyId: string = '';

  constructor() {
    this.socket = io(environment.wsUrl);
  }

  ngOnInit() {
    this.setupSocketListeners();
    this.connectUser();
  }

  ngOnDestroy() {
    this.socket.disconnect();
  }

  private connectUser() {
    this.socket.emit(SOCKET_EVENTS.USER_CONNECTED, {
      userId: this.currentPlayerId,
    });
  }

  private setupSocketListeners() {
    this.socket.on(SOCKET_EVENTS.CONNECT, () => {
      this.connectUser();
    });

    this.socket.on(SOCKET_EVENTS.ONLINE_USERS, (players: string[]) => {
      this.onlineUsers = players.filter((id) => id !== this.currentPlayerId);
    });

    this.socket.on(
      SOCKET_EVENTS.GAME_INVITE,
      (data: { gameId: string; from: string }) => {
        this.pendingInvite = data;
      },
    );

    this.socket.on(
      SOCKET_EVENTS.GAME_STARTED,
      (data: GameState & { gameId: string }) => {
        this.gameState = data;
        this.activeGameId = data.gameId;
        this.pendingInvite = null;
      },
    );

    this.socket.on(SOCKET_EVENTS.MOVE_MADE, (data: GameState) => {
      this.gameState = data;
    });

    this.socket.on(SOCKET_EVENTS.GAME_ENDED, (data: GameState) => {
      this.gameState = data;
      this.enemyId = Object.keys(this.gameState.players).find(
        (id) => id !== this.currentPlayerId,
      ) as string || '';
    });

    this.socket.on(SOCKET_EVENTS.GAME_ERROR, (data: { message: string }) => {
      // You might want to show this error to the user in a more user-friendly way
    });
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
    this.clickSound.play()

    // Send move to server
    this.socket.emit(SOCKET_EVENTS.MAKE_MOVE, {
      gameId: this.activeGameId,
      playerId: this.currentPlayerId,
      position: index,
    });
  }

  isMyTurn(): boolean {
    if (!this.gameState || !this.gameState.players[this.currentPlayerId]) {
      return false;
    }
    this.isInGame = true;

    return this.currentPlayerId === this.gameState.currentPlayer;
  }

  invitePlayer(otherPlayerId: string) {
    this.socket.emit(SOCKET_EVENTS.SEND_GAME_INVITE, {
      from: this.currentPlayerId,
      to: otherPlayerId,
    });
  }

  inviteAgain(){
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

      // Disable the accept button to prevent multiple clicks
      const acceptButton = document.querySelector(
        '.accept',
      ) as HTMLButtonElement;
      if (acceptButton) {
        acceptButton.disabled = true;
      }

      this.socket.emit(SOCKET_EVENTS.ACCEPT_INVITE, {
        gameId: this.pendingInvite.gameId,
        playerId: this.currentPlayerId,
      });

      // Clear pending invite to prevent multiple accepts
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
    console.log(this.gameState.status)
    if (this.gameState.status === 'in-progress') {
      this.socket.emit(SOCKET_EVENTS.LEAVE_GAME, {
        gameId: this.activeGameId,
        playerId: this.currentPlayerId,
      });
    }
    this.gameState.isGameOver = true;
    this.isInGame = false;
    this.router.navigate(['/']);
  }

   winner() {
    if(!this.gameState.soundPlayed){
     this.tadaSound.play()
     this.soundPlayed = true
    }
    this.gameState.soundPlayed = true

    return 'You won! ';
  }

   loser() {
    if(!this.gameState.soundPlayed){
      this.failSound.play()
     this.soundPlayed = true
     }
    return 'Opponent won!';
  }
}

import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-game-board',
  templateUrl: './game-board.component.html',
  styleUrl: './game-board.component.scss',
})
export class GameBoardComponent {
  @Input() gameState: any = {};
  @Input() currentPlayerId: any = {};
  @Input() isInGame: boolean = false;
  @Input() selectingBotLevel: boolean = false;

  @Output() makeMove = new EventEmitter<number>();
  @Output() leaveGame = new EventEmitter();
  @Output() inviteAgain = new EventEmitter();
  @Output() playWithBot = new EventEmitter();
  isMyTurn(): boolean {
    return (
      this.gameState.currentPlayer ===
      this.gameState.players[this.currentPlayerId].symbol
    );
  }
  playSound(soundType: string) {
    switch (soundType) {
      case 'click':
        const clickSound = new Audio('assets/sounds/click-sound.mp3');
        clickSound.play();
        break;
      default:
        break;
    }
  }

  winner(): string {
    this.playSound('win');
    return 'Congratulations! you win 🎉️️️️️️';
  }

  loser(): string {
    this.playSound('lose');
    return 'Opponent wins! Better luck next time!';
  }

  isPlayingWithBot(): boolean {
    return this.gameState.players['bot']?.symbol === 'O';
  }

  onMakeMove(index: number) {
    if (
      !this.gameState ||
      this.gameState.board[index] ||
      !this.isMyTurn() ||
      this.gameState.isGameOver
    ) {
      return;
    }
    this.playSound('click');
    this.makeMove.emit(index);
  }
  onLeaveGame() {
    this.leaveGame.emit();
  }

  getOtherPlayerId() {
    const otherPlayerId = Object.keys(this.gameState.players).find(
      (playerId) => playerId !== this.currentPlayerId
    ) as string;

    return otherPlayerId;
  }

  onInviteAgain() {
    this.inviteAgain.emit();
  }

  onPlayWithBot() {
    this.playWithBot.emit();
  }
}

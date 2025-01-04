import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameComponent } from './game.component';
import { PlayerListComponent } from './components/player-list/player-list.component';
import { InviteModalComponent } from './components/invite-modal/invite-modal.component';
import { GameBoardComponent } from './components/game-board/game-board.component';
import { InvalidUserComponent } from './components/invalid-user/invalid-user.component';

@NgModule({
  declarations: [
    GameComponent,
    PlayerListComponent,
    InviteModalComponent,
    GameBoardComponent,
    InvalidUserComponent,
  ],
  imports: [CommonModule],
  exports: [GameComponent],
})
export class GameModule {}

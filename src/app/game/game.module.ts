import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameComponent } from './game.component';
import { PlayerListComponent } from './components/player-list/player-list.component';

@NgModule({
  declarations: [GameComponent, PlayerListComponent],
  imports: [CommonModule],
  exports: [GameComponent],
})
export class GameModule {}

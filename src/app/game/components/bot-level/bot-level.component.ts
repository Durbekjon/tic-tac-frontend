import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-bot-level',
  templateUrl: './bot-level.component.html',
  styleUrl: './bot-level.component.scss',
})
export class BotLevelComponent {
  @Input() botLevels: { name: string; value: string }[] = [];
  @Input() selectingBotLevel: boolean = true;
  @Output() botLevelSelected = new EventEmitter<string>();

  onSelectBotLevel(botLevel: string) {
    this.botLevelSelected.emit(botLevel);
  }
}

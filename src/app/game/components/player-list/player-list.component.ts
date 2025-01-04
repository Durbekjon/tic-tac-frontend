import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-player-list',
  templateUrl: './player-list.component.html',
  styleUrl: './player-list.component.scss',
})
export class PlayerListComponent {
  @Input() onlineUsers: { firstName: string; userId: string }[] = [];
  @Input() pendingInvite: boolean = false;
  @Input() sentInvites: any[] = [];
  @Input() selectingBotLevel: boolean = false;
  @Output() invitePlayer = new EventEmitter<string>();

  onInvitePlayer(userId: string): void {
    this.invitePlayer.emit(userId);
  }
}

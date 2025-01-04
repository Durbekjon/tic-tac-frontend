import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-invite-modal',
  templateUrl: './invite-modal.component.html',
  styleUrl: './invite-modal.component.scss',
})
export class InviteModalComponent {
  @Input() pendingInvite: any;
  @Output() acceptInvite = new EventEmitter();
  @Output() rejectInvite = new EventEmitter();

  onRejectInvite(): void {
    this.rejectInvite.emit();
  }

  onAcceptInvite(): void {
    this.acceptInvite.emit();
  }
}

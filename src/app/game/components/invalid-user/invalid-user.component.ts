import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-invalid-user',
  templateUrl: './invalid-user.component.html',
  styleUrl: './invalid-user.component.scss',
})
export class InvalidUserComponent {
  @Input() user: any;
  @Input() isUserWaiting: boolean = false;
}

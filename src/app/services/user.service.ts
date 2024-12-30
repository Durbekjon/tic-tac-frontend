import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { IUser } from '../interfaces/user.interface';
@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly apiUrl = environment.apiUrl;
  private readonly appKey = environment.appKey;

  constructor(private readonly http: HttpClient) {}

  async getUser(chatId: string): Promise<IUser | null> {
    try {
      const url = `${this.apiUrl}/user/${chatId}?app_key=${this.appKey}`;
      const response = await firstValueFrom(this.http.get<IUser>(url));
      return response;
    } catch (error) {
      return null;
    }
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface User {
  id: string;
  name: string;
  email: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly apiUrl = 'http://localhost:3000/api';
  private readonly appKey = '6920f11c-1827-474b-be85-81d3fad2c057';

  constructor(private readonly http: HttpClient) {}

  async getUser(chatId: string): Promise<User | null> {
    try {
      const url = `${this.apiUrl}/user/${chatId}?app_key=${this.appKey}`;
      const response = await firstValueFrom(this.http.get<User>(url));

      return response;
    } catch (error) {
      return null;
    }
  }
}

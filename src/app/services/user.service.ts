import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; // Assuming you want to fetch user data

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private userId: string = '';
  private preferences: any = {};

  constructor(private http: HttpClient) {}

  getUserId(): string {
    return this.userId;
  }

  setUserId(id: string): void {
    this.userId = id;
  }

  setUserPreferences(preferences: any): void {
    this.preferences = preferences;
  }

  getUserPreferences(): any {
    return this.preferences;
  }

  // Example method to get user data based on chat_id
  getUser(chatId: string) {
    return this.http.get(`api/user/${chatId}`); // Adjust the API endpoint as necessary
  }
}

import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LoginResponse {
  success: boolean;
  message: string;
  userId: string;
  loginTime: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _isLoggedIn = signal(false);
  private _currentUserId = signal<string | null>(null);

  // Read-only signals
  public readonly isLoggedIn = this._isLoggedIn.asReadonly();
  public readonly currentUserId = this._currentUserId.asReadonly();

  constructor(private http: HttpClient) {
    // Check if user is already logged in from localStorage
    this.checkExistingLogin();
  }

  private checkExistingLogin(): void {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      this._currentUserId.set(storedUserId);
      this._isLoggedIn.set(true);
    }
  }

  login(userId: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('http://localhost:3000/auth/login', { userId });
  }

  logout(): Observable<{ success: boolean; message: string }> {
    const userId = this._currentUserId();
    if (!userId) {
      throw new Error('No user is currently logged in');
    }

    return this.http.delete<{ success: boolean; message: string }>(
      'http://localhost:3000/auth/logout',
      {
        body: { userId },
      }
    );
  }

  setLoggedIn(userId: string): void {
    this._currentUserId.set(userId);
    this._isLoggedIn.set(true);
    localStorage.setItem('userId', userId);
  }

  setLoggedOut(): void {
    this._currentUserId.set(null);
    this._isLoggedIn.set(false);
    localStorage.removeItem('userId');
  }

  getCurrentUserId(): string | null {
    return this._currentUserId();
  }
}

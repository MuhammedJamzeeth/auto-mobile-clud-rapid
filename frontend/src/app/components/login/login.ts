import { Component, inject, signal, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

export interface LoginResponse {
  success: boolean;
  message: string;
  userId: string;
  loginTime: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    MatIconModule,
    CommonModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent {
  userIdValue = signal<string>('');
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  private http = inject(HttpClient);

  // Event to notify parent component when login succeeds
  loginSuccess = output<LoginResponse>();

  onUserIdChange(value: string): void {
    this.userIdValue.set(value);
    // Clear error when user starts typing
    if (this.error()) {
      this.error.set(null);
    }
  }

  onLogin(): void {
    const userId = this.userIdValue().trim();

    console.log('Attempting login with userId:', userId); // Debug log

    if (!userId) {
      this.error.set('Please enter a User ID');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    const loginUrl = 'http://localhost:3000/auth/login';

    console.log('Sending login request with payload:', { userId }); // Debug log

    this.http.post<LoginResponse>(loginUrl, { userId }).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        console.log('Login successful:', response);

        // Store userId in localStorage for persistence
        localStorage.setItem('userId', response.userId);

        // Emit login success event
        this.loginSuccess.emit(response);
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error('Login error:', err);
        console.error('Error details:', err.error); // Debug log

        // Handle different error scenarios
        if (err.status === 409) {
          this.error.set(`User '${userId}' is already logged in. Please try a different User ID.`);
        } else if (err.status === 400) {
          this.error.set(err.error?.message || 'Invalid User ID. Please try again.');
        } else {
          this.error.set('Login failed. Please check your connection and try again.');
        }
      },
    });
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onLogin();
    }
  }
}

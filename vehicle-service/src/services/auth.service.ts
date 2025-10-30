import { Injectable, ConflictException } from '@nestjs/common';

@Injectable()
export class AuthService {
  // In-memory storage for logged-in users
  private loggedInUsers = new Map<string, { loginTime: Date }>();

  login(userId: string): {
    success: boolean;
    message: string;
    userId: string;
    loginTime: Date;
  } {
    // Check if user is already logged in
    if (this.loggedInUsers.has(userId)) {
      const existingUser = this.loggedInUsers.get(userId);
      throw new ConflictException(
        `User '${userId}' is already logged in since ${existingUser?.loginTime.toISOString()}`,
      );
    }

    // Add user to logged-in users
    const loginTime = new Date();
    this.loggedInUsers.set(userId, { loginTime });

    return {
      success: true,
      message: `User '${userId}' logged in successfully`,
      userId,
      loginTime,
    };
  }

  logout(userId: string): { success: boolean; message: string } {
    this.loggedInUsers.delete(userId);
    return {
      success: true,
      message: `User '${userId}' logged out successfully`,
    };
  }

  isUserLoggedIn(userId: string): boolean {
    return this.loggedInUsers.has(userId);
  }

  getLoggedInUsers(): string[] {
    return Array.from(this.loggedInUsers.keys());
  }
}

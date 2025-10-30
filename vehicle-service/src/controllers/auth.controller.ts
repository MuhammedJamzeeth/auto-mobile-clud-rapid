import {
  Controller,
  Post,
  Body,
  BadRequestException,
  Get,
  Delete,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsNotEmpty({ message: 'userId is required and cannot be empty' })
  @IsString()
  userId: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    console.log('Login request received:', loginDto); // Debug log

    const { userId } = loginDto;

    console.log('Extracted userId:', userId, 'Type:', typeof userId); // Debug log

    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      console.log('Validation failed: userId is empty or invalid'); // Debug log
      throw new BadRequestException('userId is required and cannot be empty');
    }

    try {
      const result = this.authService.login(userId.trim());
      console.log('Login successful for user:', userId.trim()); // Debug log
      return result;
    } catch (error) {
      console.log('Login error:', error); // Debug log
      throw error; // Re-throw ConflictException or other errors
    }
  }

  @Delete('logout')
  async logout(@Body() body: { userId: string }) {
    const { userId } = body;

    if (!userId || userId.trim().length === 0) {
      throw new BadRequestException('userId is required and cannot be empty');
    }

    return this.authService.logout(userId.trim());
  }

  @Get('users')
  async getLoggedInUsers() {
    return {
      loggedInUsers: this.authService.getLoggedInUsers(),
    };
  }
}

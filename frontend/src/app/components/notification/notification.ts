import { NgClass, NgIf, NgForOf, CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { SocketService } from '../../services/socket-service';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { Subject, takeUntil } from 'rxjs';

interface AppNotification {
  id: string;
  type?: string;
  status?: string;
  message?: string;
  timestamp?: string;
  raw?: any;
}

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatChipsModule],
  templateUrl: './notification.html',
  styleUrl: './notification.scss',
})
export class Notification implements OnInit, OnDestroy {
  notifications: AppNotification[] = [];
  isConnected = false;
  connectionError = false;

  // lifetime in ms
  private readonly life = 60000;
  private destroy$ = new Subject<void>();

  constructor(private socketService: SocketService) {}

  ngOnInit(): void {
    // Subscribe to connection status
    this.socketService.connection$.pipe(takeUntil(this.destroy$)).subscribe((connected) => {
      this.isConnected = connected;
      this.connectionError = false;
      console.log('Notification component - Socket connection status:', connected);
    });

    // Subscribe to connection errors
    this.socketService.connectionError$.pipe(takeUntil(this.destroy$)).subscribe((error) => {
      this.connectionError = true;
      console.error('Notification component - Socket connection error:', error);
      // Show error notification
      this.show({
        id: `error-${Date.now()}`,
        type: 'error',
        status: 'failed',
        message: 'Failed to connect to notification service. Retrying...',
        timestamp: new Date().toISOString(),
      });

      // Auto-retry connection after 5 seconds
      setTimeout(() => {
        if (!this.isConnected) {
          console.log('Auto-retrying socket connection...');
          this.socketService.connect();
        }
      }, 5000);
    });

    // Connect and setup notification listener
    console.log('Notification component initializing socket connection...');
    this.socketService.connect();
    this.socketService.onNotify((data: any) => {
      console.log('Notification component - Received notification:', data);

      // Normalize expected payload shape and show message
      const n: AppNotification = {
        id: data?.id ?? String(Date.now()),
        type: data?.type,
        status: data?.status,
        message: data?.message ?? data?.data?.message ?? JSON.stringify(data),
        timestamp: data?.timestamp,
        raw: data,
      };

      this.show(n);

      // If this is an import completion notification, show additional feedback
      if (data?.type === 'import' && data?.status === 'completed') {
        console.log(data?.data?.data);
        const importedCount = data?.data?.data?.imported || 0;
        const errorCount = data?.data?.data?.errors || 0;

        setTimeout(() => {
          this.show({
            id: `refresh-${Date.now()}`,
            type: 'info',
            status: 'completed',
            message: `Vehicle table refreshed! ${importedCount} vehicles imported${
              errorCount > 0 ? ` (${errorCount} errors)` : ''
            }`,
            timestamp: new Date().toISOString(),
          });
        }, 1500); // Show after table refresh
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.socketService.disconnect();
  }

  testNotification(): void {
    // Add a manual test notification
    this.show({
      id: `test-${Date.now()}`,
      type: 'info',
      status: 'completed',
      message: 'Test notification - frontend is working!',
      timestamp: new Date().toISOString(),
    });

    // Also test the backend connection
    fetch('http://localhost:3001/test/notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Test notification from frontend' }),
    })
      .then((response) => response.json())
      .then((data) => console.log('Backend test notification sent:', data))
      .catch((error) => {
        console.error('Error sending backend test notification:', error);
        this.show({
          id: `error-${Date.now()}`,
          type: 'error',
          status: 'failed',
          message:
            'Failed to send backend test notification. Check if notification service is running.',
          timestamp: new Date().toISOString(),
        });
      });
  }

  show(n: AppNotification): void {
    // Push to list and schedule removal
    this.notifications = [n, ...this.notifications];

    // Error notifications stay longer for better visibility
    const lifetime = n.type === 'error' || n.status === 'failed' ? this.life * 2 : this.life;
    setTimeout(() => this.remove(n.id), lifetime);
  }

  remove(id: string): void {
    this.notifications = this.notifications.filter((x) => x.id !== id);
  }

  // Method to show critical error notifications with enhanced highlighting
  showCriticalError(message: string, details?: any): void {
    this.show({
      id: `critical-error-${Date.now()}`,
      type: 'error',
      status: 'failed',
      message: `⚠️ CRITICAL ERROR: ${message}`,
      timestamp: new Date().toISOString(),
      raw: details,
    });
  }

  getNotificationIcon(type: string): string {
    switch (type.toLowerCase()) {
      case 'success':
      case 'completed':
        return 'check_circle';
      case 'error':
      case 'failed':
        return 'error_outline';
      case 'warning':
        return 'warning_amber';
      case 'info':
      default:
        return 'info_outline';
    }
  }

  // Method to get notification icon color class
  getNotificationIconClass(type: string, status: string): string {
    const notificationType = type?.toLowerCase() || status?.toLowerCase() || '';
    switch (notificationType) {
      case 'error':
      case 'failed':
        return 'error-icon';
      case 'success':
      case 'completed':
        return 'success-icon';
      case 'warning':
        return 'warning-icon';
      case 'info':
      default:
        return 'info-icon';
    }
  }
}

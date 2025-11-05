import { NgClass, NgIf, NgForOf, CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { SocketService } from '../../services/socket-service';
import { NotificationService, AppNotification } from '../../services/notification.service';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { Subject, takeUntil } from 'rxjs';
import { App } from '../../app';

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

  private destroy$ = new Subject<void>();
  private readonly app = inject(App);
  private readonly notificationService = inject(NotificationService);

  constructor(private socketService: SocketService) {}

  ngOnInit(): void {
    console.log('Notification component initialized');
    
    // Subscribe to notifications from the service
    this.notificationService.notifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe((notifications) => {
        console.log('Notification component - Received notifications update:', notifications.length);
        this.notifications = notifications;
      });

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

    // Note: WebSocket notification listener is now setup at App component level
    // This ensures notifications are received even when this component is destroyed
  }

  ngOnDestroy(): void {
    console.log('Notification component destroyed');
    this.destroy$.next();
    this.destroy$.complete();
    // Note: We don't clear notifications here anymore - they persist in the service
    // this.socketService.disconnect();
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
    // Delegate to the service instead of managing locally
    this.notificationService.add(n);
  }

  remove(id: string): void {
    // Delegate to the service instead of managing locally
    this.notificationService.remove(id);
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

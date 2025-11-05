import { Component, signal, inject, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Upload } from './components/upload/upload';
import { Notification } from './components/notification/notification';
import { ConnectionStatus } from './components/connection-status/connection-status';
import { VehicleList } from './components/vehicle-list/vehicle-list';
import { GlobalLoading } from './components/global-loading/global-loading';
import { LoginComponent, LoginResponse } from './components/login/login';
import { LoadingService } from './services/loading.service';
import { AuthService } from './services/auth.service';
import { SocketService } from './services/socket-service';
import { NotificationService, AppNotification } from './services/notification.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    DecimalPipe,
    RouterOutlet,
    RouterModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    MatCardModule,
    MatTooltipModule,
    Upload,
    Notification,
    ConnectionStatus,
    VehicleList,
    GlobalLoading,
    LoginComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements AfterViewInit {
  @ViewChild('vehicleList') vehicleListComponent?: VehicleList;

  protected readonly title = signal('Auto Mobile Cloud Rapid');
  protected readonly showRightPanel = signal(false);
  protected readonly loadingService = inject(LoadingService);
  protected readonly authService = inject(AuthService);
  private readonly socketService = inject(SocketService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private notificationListenerSetup = false;

  isMainRoute(): boolean {
    return this.router.url === '/' || this.router.url === '';
  }

  ngAfterViewInit() {
    // Vehicle list component is now available for manual refresh if needed
    console.log('VehicleList component reference:', this.vehicleListComponent);

    console.log('App page initializing socket connection...');
    this.connectWebSocket();
  }

  connectWebSocket(): void {
    console.log('Connecting to WebSocket from App component...');
    this.socketService.connect();

    // Setup notification listener once at app level
    if (!this.notificationListenerSetup) {
      this.setupNotificationListener();
      this.notificationListenerSetup = true;
    }

    if (!this.socketService.isConnected) {
      this.socketService.connection$.subscribe((connected) => {
        if (connected) {
          console.log('WebSocket connected successfully from App component');

          const userId = this.authService.getCurrentUserId();
          if (userId) {
            this.socketService.joinUser(userId);
          }
        } else {
          console.log('WebSocket disconnected from App component');
        }
      });
    }
  }

  setupNotificationListener(): void {
    console.log('Setting up notification listener at App level...');

    // Subscribe to notification observable from socket service
    this.socketService.notification$.subscribe((data: any) => {
      console.log('App component - Received notification:', data);

      // Normalize expected payload shape and add to service
      const notification: AppNotification = {
        id: data?.id ?? String(Date.now()),
        type: data?.type,
        status: data?.status,
        message: data?.message ?? data?.data?.message ?? JSON.stringify(data),
        timestamp: data?.timestamp,
        raw: data,
      };

      // Add notification to the service (it will persist even if panel is closed)
      this.notificationService.add(notification);

      // Open the right panel when a notification arrives
      this.openRightPanel();

      // If this is an import completion notification, show additional feedback
      if (data?.type === 'import' && data?.status === 'completed') {
        console.log(data?.data?.data);
        const importedCount = data?.data?.data?.imported || 0;
        const errorCount = data?.data?.data?.errors || 0;

        setTimeout(() => {
          this.notificationService.add({
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

  onLoginSuccess(loginResponse: LoginResponse): void {
    console.log('User logged in successfully:', loginResponse);
    this.authService.setLoggedIn(loginResponse.userId);

    // Join user for notifications after a brief delay to ensure socket is ready
    setTimeout(() => {
      if (this.socketService.isConnected) {
        this.socketService.joinUser(loginResponse.userId);
        console.log('User joined for notifications on login:', loginResponse.userId);
      }
    }, 500);
  }

  onLogout(): void {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      console.error('No user is logged in');
      return;
    }

    console.log(`Logging out user: ${userId}`);

    this.authService.logout().subscribe({
      next: (response) => {
        console.log('Logout successful:', response);
        this.authService.setLoggedOut();
        // Close the right panel when logging out
        this.showRightPanel.set(false);
      },
      error: (err) => {
        console.error('Logout error:', err);
        // Even if the backend call fails, log out locally
        this.authService.setLoggedOut();
        this.showRightPanel.set(false);
      },
    });
  }

  toggleRightPanel() {
    this.showRightPanel.set(!this.showRightPanel());
  }

  openRightPanel() {
    if (!this.showRightPanel()) {
      this.showRightPanel.set(true);
    }
  }

  onUploadStarted() {
    // Automatically show the notification panel when upload starts
    this.showRightPanel.set(true);
    console.log('Upload started - notification panel should be visible');
  }

  onUploadCompleted(response: any) {
    console.log(
      'Upload completed, processing will start automatically via backend service...',
      response
    );
    // Keep the notification panel open to show processing notifications
    this.showRightPanel.set(true);

    // Note: Vehicle table will be automatically refreshed when import completion notification is received
    // The VehicleList component is listening for 'import' + 'completed' notifications
    console.log(
      'Vehicle table will auto-refresh when processing completes via WebSocket notification'
    );
  }

  onExportStarted() {
    // Automatically show the notification panel when export starts
    this.showRightPanel.set(true);
    console.log('Export started - notification panel should be visible');
  }
}

import { Component, signal, inject, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { Upload } from './components/upload/upload';
import { Notification } from './components/notification/notification';
import { ConnectionStatus } from './components/connection-status/connection-status';
import { VehicleList } from './components/vehicle-list/vehicle-list';
import { GlobalLoading } from './components/global-loading/global-loading';
import { LoginComponent, LoginResponse } from './components/login/login';
import { LoadingService } from './services/loading.service';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    DecimalPipe,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    MatCardModule,
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

  ngAfterViewInit() {
    // Vehicle list component is now available for manual refresh if needed
    console.log('VehicleList component reference:', this.vehicleListComponent);
  }

  onLoginSuccess(loginResponse: LoginResponse): void {
    console.log('User logged in successfully:', loginResponse);
    this.authService.setLoggedIn(loginResponse.userId);
  }

  toggleRightPanel() {
    this.showRightPanel.set(!this.showRightPanel());
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
}

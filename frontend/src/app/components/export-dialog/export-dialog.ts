import { Component, inject, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ExportService } from '../../services/export.service';
import { AuthService } from '../../services/auth.service';
import { SocketService } from '../../services/socket-service';

export interface ExportDialogData {
  onExportStarted?: () => void;
}

@Component({
  selector: 'app-export-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './export-dialog.html',
  styleUrl: './export-dialog.scss',
})
export class ExportDialogComponent implements OnInit, OnDestroy {
  private exportService = inject(ExportService);
  private dialogRef = inject(MatDialogRef<ExportDialogComponent>);
  private authService = inject(AuthService);
  private socketService = inject(SocketService);

  age: number | null = null;
  loading = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: ExportDialogData = {}) {}

  ngOnInit(): void {
    // Connect to WebSocket when dialog opens
    this.connectWebSocket();
  }

  ngOnDestroy(): void {
    // Optionally disconnect when dialog is closed
    // Note: You might want to keep the connection alive for other parts of the app
    // this.socketService.disconnect();
  }

  private connectWebSocket(): void {
    if (!this.socketService.isConnected) {
      console.log('Connecting to WebSocket for export notifications...');
      this.socketService.connect();

      // Subscribe to connection status
      this.socketService.connection$.subscribe((connected) => {
        if (connected) {
          console.log('WebSocket connected successfully');
          // Join user for notifications if userId is available
          const userId = this.authService.getCurrentUserId();
          if (userId) {
            this.socketService.joinUser(userId);
          }
        } else {
          console.log('WebSocket disconnected');
        }
      });

      // Subscribe to connection errors
      this.socketService.connectionError$.subscribe((error) => {
        console.error('WebSocket connection error:', error);
      });
    } else {
      console.log('WebSocket already connected');
      // Join user for notifications if userId is available
      const userId = this.authService.getCurrentUserId();
      if (userId) {
        this.socketService.joinUser(userId);
      }
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }

  export(): void {
    this.loading = true;

    // Trigger the right panel to open for notifications
    if (this.data.onExportStarted) {
      this.data.onExportStarted();
    }

    // Start the export job with current user ID
    const userId = this.authService.getCurrentUserId();
    console.log('Export starting with userId:', userId);

    this.exportService.startExport(this.age || undefined, userId || undefined).subscribe({
      next: (job) => {
        console.log('Export job started:', job);

        // Poll for job completion to handle download
        this.exportService.pollJobStatus(job.jobId).subscribe({
          next: (status) => {
            console.log('Export status:', status);

            if (status.status === 'completed') {
              // Download the completed file
              this.exportService.downloadExportFile(job.jobId).subscribe({
                next: (blob: Blob) => {
                  // Generate filename with timestamp and age filter info
                  const timestamp = new Date().toISOString().split('T')[0];
                  const ageFilter = this.age ? `_age-${this.age}` : '_all';
                  const filename = `vehicles_export_${timestamp}${ageFilter}.csv`;

                  // takes the binary data (Blob) and triggers a file download in the browser
                  this.exportService.downloadFile(blob, filename);
                  this.loading = false;
                  this.dialogRef.close({ success: true });
                },
                error: (error) => {
                  console.error('Download error:', error);
                  this.loading = false;
                  // Error will be shown in notifications via WebSocket
                },
              });
            } else if (status.status === 'failed') {
              console.error('Export failed:', status.failedReason);
              this.loading = false;
              // Error will be shown in notifications via WebSocket
            }
          },
          error: (error) => {
            console.error('Export polling error:', error);
            this.loading = false;
            // Error will be shown in notifications via WebSocket
          },
        });
      },
      error: (error) => {
        console.error('Export start error:', error);
        this.loading = false;
        // Error will be shown in notifications via WebSocket
      },
    });
  }
}

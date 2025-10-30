import { Component, inject, signal, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';

import { CommonModule } from '@angular/common';
import { LoadingService } from '../../services/loading.service';
import { SocketService } from '../../services/socket-service';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatCardModule,
    CommonModule,
  ],
  templateUrl: './upload.html',
  styleUrl: './upload.scss',
})
export class Upload {
  file = signal<File | undefined>(undefined);
  progress = signal<number>(0);
  private http = inject(HttpClient);
  private loadingService = inject(LoadingService);
  private socketService = inject(SocketService);

  // Event to notify parent component to show notification panel
  uploadStarted = output<void>();

  // Event to notify parent component when upload completes
  uploadCompleted = output<any>();

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.file.set(input.files[0]);
      console.log('Selected file:', this.file.name);
    }
  }

  upload(): void {
    const file = this.file();
    const url = 'http://localhost:3000/upload/csv';

    if (!file) {
      console.error('No file selected for upload.');
      return;
    }

    // Ensure socket connection is established for notifications
    if (!this.socketService.isConnected) {
      console.log('Connecting to notification service...');
      this.socketService.connect();
    }

    // Emit event to show notification panel
    console.log('Emitting uploadStarted event...');
    this.uploadStarted.emit();

    // Start loading state
    this.loadingService.show(`Uploading ${file.name}...`);

    const formData = new FormData();
    formData.append('file', file);

    this.http
      .post(url, formData, {
        reportProgress: true,
        observe: 'events',
      })
      .subscribe({
        next: (event) => {
          if (event.type === HttpEventType.UploadProgress && event.total) {
            const percentDone = Math.round((100 * event.loaded) / event.total);
            this.progress.set(percentDone);
            this.loadingService.updateProgress(
              percentDone,
              `Uploading ${file.name}... ${percentDone}%`
            );
            console.log(`File is ${percentDone}% uploaded.`);
          } else if (event.type === HttpEventType.Response) {
            console.log('File upload complete:', event.body);
            this.loadingService.updateProgress(100, 'Upload completed successfully!');

            // Log success for debugging
            console.log('Upload response received. Backend will process the file asynchronously.');

            // Emit upload completed event so parent can show notifications / processing status
            this.uploadCompleted.emit(event.body);

            // Briefly show 100% progress then hide the global loading popup so
            // backend processing (which happens asynchronously) doesn't keep the UI blocked.
            setTimeout(() => {
              this.loadingService.hide();
              this.progress.set(0);
            }, 500);
          }
        },
        error: (err) => {
          console.error('Upload error:', err);
          this.loadingService.hide();
          this.progress.set(0);
        },
      });
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.file.set(files[0]);
      console.log('Dropped file:', this.file()?.name);
    }
  }
}

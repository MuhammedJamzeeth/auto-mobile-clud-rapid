import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpEventType } from '@angular/common/http';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './upload.html',
  styleUrl: './upload.scss',
})
export class Upload {
  file = signal<File | undefined>(undefined);
  progress = signal<number>(0);
  private http = inject(HttpClient);

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
            console.log(`File is ${percentDone}% uploaded.`);
          } else if (event.type === HttpEventType.Response) {
            console.log('File upload complete:', event.body);
          }
        },
        error: (err) => {
          console.error('Upload error:', err);
        },
      });
  }
}

import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, interval, switchMap, takeWhile, map } from 'rxjs';

export interface ExportJob {
  jobId: string;
  message: string;
  status: string;
}

export interface JobStatus {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  failedReason?: string;
  filePath?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ExportService {
  private http = inject(HttpClient);
  private readonly graphqlUrl = 'http://localhost:4040/graphql'; // GraphQL Gateway
  private readonly downloadUrl = 'http://localhost:3000'; // Vehicle service port

  startExport(age?: number, userId?: string): Observable<ExportJob> {
    const mutation = `
      mutation ExportVehicles($input: ExportInput!) {
        exportJob(input: $input) {
          jobId
          message
          status
        }
      }
    `;
  
    

    const input: any = {};
    if (age !== undefined) input.age = age;
    if (userId) input.userId = userId;

    const variables = { input };

    return this.http
      .post<any>(this.graphqlUrl, { query: mutation, variables })
      .pipe(map((response) => response.data.exportJob));
  }

  getJobStatus(jobId: string): Observable<JobStatus> {
    const query = `
      query GetJobStatus($jobId: String!) {
        jobStatus(jobId: $jobId) {
          jobId
          status
          progress
          failedReason
          filePath
        }
      }
    `;

    const variables = { jobId };

    return this.http
      .post<any>(this.graphqlUrl, { query, variables })
      .pipe(map((response) => response.data.jobStatus));
  }

  pollJobStatus(jobId: string): Observable<JobStatus> {
    return interval(1000).pipe(
      switchMap(() => this.getJobStatus(jobId)),
      takeWhile((status) => status.status === 'queued' || status.status === 'processing', true)
    );
  }

  downloadExportFile(jobId: string): Observable<Blob> {
    return this.http.get(`${this.downloadUrl}/export/download/${jobId}`, {
      responseType: 'blob',
    });
  }

  downloadFile(blob: Blob, filename: string = 'vehicles_export.csv'): void {
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.download = filename;
    anchor.href = url;
    anchor.click();
    window.URL.revokeObjectURL(url);
  }
}

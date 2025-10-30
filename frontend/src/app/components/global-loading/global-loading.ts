import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-global-loading',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule, MatIconModule],
  template: `
    @if (loadingService.loading()) {
    <div class="loading-overlay">
      <div class="loading-content">
        <div class="spinner-container">
          <mat-spinner diameter="60" strokeWidth="4"></mat-spinner>
          <mat-icon class="loading-icon">cloud_upload</mat-icon>
        </div>
        <h3>{{ loadingService.message() }}</h3>
        <div class="loading-progress">{{ loadingService.progress() | number : '1.0-0' }}%</div>
      </div>
    </div>
    }
  `,
  styles: [
    `
      .loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease-out;
      }

      .loading-content {
        text-align: center;
        color: white;

        .spinner-container {
          position: relative;
          display: inline-block;
          margin-bottom: 24px;

          mat-spinner {
            ::ng-deep circle {
              stroke: #60a5fa;
            }
          }

          .loading-icon {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 24px;
            color: #60a5fa;
            animation: bounce 2s infinite;
          }
        }

        h3 {
          margin: 0 0 12px 0;
          font-size: 20px;
          font-weight: 500;
          color: #e5e7eb;
        }

        .loading-progress {
          font-size: 16px;
          font-weight: 600;
          color: #60a5fa;
        }
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      @keyframes bounce {
        0%,
        20%,
        50%,
        80%,
        100% {
          transform: translate(-50%, -50%) translateY(0);
        }
        40% {
          transform: translate(-50%, -50%) translateY(-10px);
        }
        60% {
          transform: translate(-50%, -50%) translateY(-5px);
        }
      }
    `,
  ],
})
export class GlobalLoading {
  protected readonly loadingService = inject(LoadingService);
}

import { Component, OnDestroy, OnInit } from '@angular/core';
import { SocketService } from '../../services/socket-service';
import { Subscription } from 'rxjs';
import { auditTime, distinctUntilChanged } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  standalone: true,
  selector: 'app-connection-status',
  imports: [CommonModule, MatIconModule, MatChipsModule, MatTooltipModule],
  templateUrl: './connection-status.html',
  styleUrl: './connection-status.scss',
})
export class ConnectionStatus implements OnInit, OnDestroy {
  status: 'connected' | 'disconnected' = 'disconnected';
  error: string | null = null;
  private subs = new Subscription();

  constructor(private socketService: SocketService) {}

  ngOnInit(): void {
    // Debounce/aggregate rapid toggles to avoid UI flicker.
    const sub1 = this.socketService.connection$
      .pipe(auditTime(500), distinctUntilChanged())
      .subscribe((connected) => {
        this.status = connected ? 'connected' : 'disconnected';
        if (connected) {
          this.error = null;
        }
      });

    const sub2 = this.socketService.connectionError$.subscribe((err) => {
      try {
        this.error = typeof err === 'string' ? err : JSON.stringify(err.message);
      } catch {
        this.error = 'Connection error';
      }

      // Clear error after a short time so UI doesn't stay stuck.
      setTimeout(() => (this.error = null), 5000);
    });

    this.subs.add(sub1);
    this.subs.add(sub2);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  getStatusTooltip(): string {
    if (this.status === 'connected') {
      return 'Real-time connection established';
    } else {
      return this.error || 'Connection lost - attempting to reconnect';
    }
  }
}

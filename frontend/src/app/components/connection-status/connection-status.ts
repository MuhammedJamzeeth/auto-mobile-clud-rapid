import { Component, OnDestroy, OnInit } from '@angular/core';
import { SocketService } from '../../services/socket-service';
import { Subscription } from 'rxjs';
import { auditTime, distinctUntilChanged } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-connection-status',
  imports: [CommonModule],
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
}

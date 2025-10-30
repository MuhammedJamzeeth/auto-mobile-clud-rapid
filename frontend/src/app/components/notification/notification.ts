import { NgClass, NgIf, NgForOf, CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { SocketService } from '../../services/socket-service';

interface AppNotification {
  id: string;
  type?: string;
  status?: string;
  message?: string;
  timestamp?: string;
  raw?: any;
}

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [NgForOf, NgIf, NgClass, CommonModule],
  templateUrl: './notification.html',
  styleUrl: './notification.scss',
})
export class Notification implements OnInit {
  notifications: AppNotification[] = [];

  // lifetime in ms
  private readonly life = 60000;

  constructor(private socketService: SocketService) {}

  ngOnInit(): void {
    this.socketService.connect();
    this.socketService.onNotify((data: any) => {
      // Normalize expected payload shape and show message
      const n: AppNotification = {
        id: data?.id ?? String(Date.now()),
        type: data?.type,
        status: data?.status,
        message: data?.message ?? data?.data?.message ?? JSON.stringify(data),
        timestamp: data?.timestamp,
        raw: data,
      };

      this.show(n);
    });
  }

  show(n: AppNotification): void {
    // Push to list and schedule removal
    this.notifications = [n, ...this.notifications];

    setTimeout(() => this.remove(n.id), this.life);
  }

  remove(id: string): void {
    this.notifications = this.notifications.filter((x) => x.id !== id);
  }
}

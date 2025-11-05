import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface AppNotification {
  id: string;
  type?: string;
  status?: string;
  message?: string;
  timestamp?: string;
  raw?: any;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<AppNotification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  // lifetime in ms
  private readonly life = 60000;
  private timeoutMap = new Map<string, ReturnType<typeof setTimeout>>();

  constructor() {}

  getNotifications(): AppNotification[] {
    return this.notificationsSubject.value;
  }

  add(notification: AppNotification): void {
    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next([notification, ...currentNotifications]);
    console.log('NotificationService - Added notification:', notification);
    console.log('NotificationService - Total notifications:', this.notificationsSubject.value.length);

    // Error notifications stay longer for better visibility
    const lifetime =
      notification.type === 'error' || notification.status === 'failed' ? this.life * 2 : this.life;

    // Clear any existing timeout for this notification
    if (this.timeoutMap.has(notification.id)) {
      clearTimeout(this.timeoutMap.get(notification.id)!);
    }

    // Set new timeout to auto-remove
    const timeoutId = setTimeout(() => {
      this.remove(notification.id);
    }, lifetime);

    this.timeoutMap.set(notification.id, timeoutId);
  }

  remove(id: string): void {
    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next(currentNotifications.filter((x) => x.id !== id));

    // Clear the timeout if it exists
    if (this.timeoutMap.has(id)) {
      clearTimeout(this.timeoutMap.get(id)!);
      this.timeoutMap.delete(id);
    }
  }

  clear(): void {
    // Clear all timeouts
    this.timeoutMap.forEach((timeoutId) => clearTimeout(timeoutId));
    this.timeoutMap.clear();
    this.notificationsSubject.next([]);
  }
}

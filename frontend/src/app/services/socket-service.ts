import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket: Socket;
  private readonly url: string = 'http://localhost:3001';
  private connectionSubject = new BehaviorSubject<boolean>(false);
  public connection$: Observable<boolean> = this.connectionSubject.asObservable();

  private errorSubject = new Subject<any>();
  public connectionError$: Observable<any> = this.errorSubject.asObservable();

  // Add a subject for notifications
  private notificationSubject = new Subject<any>();
  public notification$: Observable<any> = this.notificationSubject.asObservable();

  constructor() {
    this.socket = io(this.url, {
      autoConnect: false,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    // Centralized listeners: emit connection state and errors to observers
    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.connectionSubject.next(true);
    });

    this.socket.on('disconnect', (reason: string) => {
      console.log('Socket disconnected:', reason);
      this.connectionSubject.next(false);
    });

    this.socket.on('connect_error', (err: any) => {
      console.error('Socket connect_error:', err);
      this.errorSubject.next(err);
    });

    // Setup notification listener once in constructor
    this.socket.on('notification', (data: any) => {
      console.log('Socket received notification:', data);
      this.notificationSubject.next(data);
    });
  }

  connect(): void {
    if (!this.socket.connected) {
      // Start the connection — actual connected state will be emitted
      // by the centralized 'connect' event listener in the constructor.
      this.socket.connect();
    } else {
      console.log('Socket already connected');
    }
  }

  disconnect(): void {
    if (this.socket.connected) {
      // Centralized 'disconnect' listener will emit connection state.
      this.socket.disconnect();
    } else {
      console.log('Socket already disconnected');
    }
  }

  onNotify(callback: (data: any) => void): void {
    this.socket.on('notification', callback);
  }

  joinUser(userId: string): void {
    if (this.socket && this.socket.connected) {
      console.log(`Joining user ${userId} to notification service`);
      this.socket.emit('join', { userId });

      // Listen for join confirmation
      this.socket.on('joined', (data: any) => {
        console.log('Successfully joined notifications:', data);
      });
    } else {
      console.warn('Cannot join user: socket not connected');
    }
  }

  get isConnected(): boolean {
    return !!(this.socket && this.socket.connected);
  }
}

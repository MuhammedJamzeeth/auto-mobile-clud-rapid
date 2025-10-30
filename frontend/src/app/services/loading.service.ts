import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private _loading = signal(false);
  private _progress = signal(0);
  private _message = signal('');

  // Read-only signals
  public readonly loading = this._loading.asReadonly();
  public readonly progress = this._progress.asReadonly();
  public readonly message = this._message.asReadonly();

  show(message: string = 'Processing...') {
    this._message.set(message);
    this._progress.set(0);
    this._loading.set(true);
  }

  hide() {
    this._loading.set(false);
    this._progress.set(0);
    this._message.set('');
  }

  updateProgress(progress: number, message?: string) {
    this._progress.set(Math.min(Math.max(progress, 0), 100));
    if (message) {
      this._message.set(message);
    }
  }

  setMessage(message: string) {
    this._message.set(message);
  }
}

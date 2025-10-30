import { Injectable, Logger } from '@nestjs/common';
import {
  NotificationGateway,
  NotificationPayload,
} from './notification.gateway';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private readonly gateway: NotificationGateway) {}

  // Minimal send method so processors can call a single place for sending
  async send(recipient: string, message: string, raw?: any) {
    // Compose a notification payload and broadcast to connected websocket clients
    const payload: NotificationPayload = {
      type: raw?.type ?? 'import',
      status: raw?.status ?? 'started',
      message,
      data: { recipient, ...raw },
      timestamp: new Date(),
    };

    this.logger.debug(`NotificationService.send() called for ${recipient}`);
    try {
      this.gateway.sendNotification(payload);
      this.logger.log(
        `Notification emitted to websocket clients for ${recipient}`,
      );
      return { ok: true };
    } catch (err) {
      this.logger.error('Failed to emit websocket notification', err as Error);
      return { ok: false, error: (err as Error).message };
    }
  }
}

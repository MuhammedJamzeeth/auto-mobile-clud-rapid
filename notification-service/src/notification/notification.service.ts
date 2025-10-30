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
    // Compose a notification payload and send to specific user or broadcast
    const payload: NotificationPayload = {
      type: raw?.type ?? 'import',
      status: raw?.status ?? 'started',
      message,
      data: { recipient, ...raw },
      timestamp: new Date(),
      userId: recipient, // Include userId for user-specific notifications
    };

    this.logger.debug(
      `NotificationService.send() called for user ${recipient}`,
    );
    try {
      this.gateway.sendNotification(payload);
      this.logger.log(`Notification sent to user ${recipient}`);
      return { ok: true };
    } catch (err) {
      this.logger.error(
        `Failed to send notification to user ${recipient}`,
        err as Error,
      );
      return { ok: false, error: (err as Error).message };
    }
  }
}

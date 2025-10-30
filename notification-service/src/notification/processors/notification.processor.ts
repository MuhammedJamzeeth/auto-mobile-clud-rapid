import { Process, Processor } from '@nestjs/bull';
import { NotificationService } from '../notification.service';
import { Logger } from '@nestjs/common';

@Processor('notification')
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(private readonly notificationService: NotificationService) {}

  @Process('notify')
  async handleSendNotification(job: any) {
    const data = job?.data ?? {};
    const recipient = data.recipient ?? data.userId ?? data.user ?? 'unknown';
    const message = data.message ?? data.text ?? '';

    this.logger.debug(`Notification job received: ${JSON.stringify(data)}`);
    try {
      const result = await this.notificationService.send(
        recipient,
        message,
        data,
      );
      if (result.ok) {
        this.logger.log(`Notification sent to ${recipient}`);
      }
    } catch (err) {
      this.logger.error(
        `Failed to send notification to ${recipient}`,
        err as Error,
      );
    }
  }
}

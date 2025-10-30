import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationProcessor } from './processors/notification.processor';
import { BullModule } from '@nestjs/bull';
import { NotificationGateway } from './notification.gateway';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'notification',
    }),
  ],
  providers: [NotificationService, NotificationProcessor, NotificationGateway],
  exports: [NotificationService, NotificationGateway],
})
export class NotificationModule {}

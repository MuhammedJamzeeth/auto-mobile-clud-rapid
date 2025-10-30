import { Module } from '@nestjs/common';
import { NotificationModule } from './notification/notification.module';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),
    NotificationModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

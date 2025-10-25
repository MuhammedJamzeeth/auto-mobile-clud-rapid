import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vehicle } from 'src/entities/vehicle.entity';
import { NotificationGateway } from 'src/gateways/notification.gateway';
import { VehicleService } from 'src/services/vehicle.service';
import { JobService } from 'src/services/job.service';
import { ImportJobProcessor } from 'src/processors/import-job.processor';
import { BullModule } from '@nestjs/bull';
import { UploadController } from 'src/controllers/upload.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vehicle]),
    // Register the queue used by JobService and the processor
    BullModule.registerQueue({ name: 'import-queue' }),
  ],
  controllers: [UploadController],
  providers: [
    NotificationGateway,
    VehicleService,
    JobService,
    ImportJobProcessor,
  ],
  exports: [VehicleService, JobService],
})
export class VehicleModule {}

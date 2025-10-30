import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vehicle } from 'src/entities/vehicle.entity';
import { NotificationGateway } from 'src/gateways/notification.gateway';
import { VehicleService } from 'src/services/vehicle.service';
import { VehicleResolver } from 'src/resolvers/vehicle.resolver';
import { JobService } from 'src/services/job.service';
import { ImportJobProcessor } from 'src/processors/import-job.processor';
import { BullModule } from '@nestjs/bull';
import { UploadController } from 'src/controllers/upload.controller';
import { JobResolver } from 'src/resolvers/job.resolver';
import { ExportJobProcessor } from 'src/processors/export-job.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vehicle]),
    // Register the queue used by JobService and the processor
    BullModule.registerQueue({ name: 'import-queue' }),
    BullModule.registerQueue({ name: 'notification' }),
    BullModule.registerQueue({ name: 'export-queue' }),
  ],
  controllers: [UploadController],
  providers: [
    NotificationGateway,
    VehicleService,
    JobService,
    ImportJobProcessor,
    ExportJobProcessor,
    VehicleResolver,
    JobResolver,
  ],
  exports: [VehicleService, JobService],
})
export class VehicleModule {}

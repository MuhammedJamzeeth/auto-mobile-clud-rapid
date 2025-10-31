import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job, Queue } from 'bull';
import { VehicleService } from 'src/services/vehicle.service';
import { createObjectCsvWriter } from 'csv-writer';
import * as fs from 'fs';
import * as path from 'path';

export interface ExportJobData {
  age?: number;
  exportPath?: string;
  userId?: string;
  filePath?: string;
  completed?: boolean;
  error?: string;
}

@Processor('export-queue')
export class ExportJobProcessor {
  private readonly logger = new Logger(ExportJobProcessor.name);

  constructor(
    private readonly vehicleService: VehicleService,
    @InjectQueue('notification') private readonly notification: Queue,
  ) {}

  @Process('export-vehicles')
  async handleExportVehicles(job: Job<ExportJobData>) {
    // this.logger.log('Processing export job:', job.id, 'with data:', job.data);
    const { age, userId } = job.data;
    this.logger.debug(
      `Starting export job for vehicles with age: ${age ?? 'any'} userId: ${userId}`,
    );

    await this.notification.add('notify', {
      userId: userId,
      message: `Export job started for vehicles with age: ${age ?? 'any'}`,
    });

    try {
      const vehicles = await this.vehicleService.findVehiclesByAge(age);

      if (vehicles.length === 0) {
        this.logger.debug('No vehicles found for the specified age criteria.');
        // send notification
        await this.notification.add('notify', {
          userId: job.data.userId,
          message: `Export job completed: No vehicles found for the specified age criteria.`,
        });
        return;
      }

      // Generate file path with job ID for easy retrieval
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const ageFilter = age ? `_age-${age}` : '_all';
      const fileName = `vehicles_export_${job.id}_${timestamp}${ageFilter}.csv`;
      const filePath = path.join(process.cwd(), 'exports', fileName);

      // Ensure exports directory exists
      const exportDir = path.dirname(filePath);
      if (!fs.existsSync(exportDir)) {
        fs.mkdirSync(exportDir, { recursive: true });
      }

      // Configure CSV writer
      const csvWriter = createObjectCsvWriter({
        path: filePath,
        header: [
          { id: 'id', title: 'ID' },
          { id: 'firstName', title: 'First Name' },
          { id: 'lastName', title: 'Last Name' },
          { id: 'email', title: 'Email' },
          { id: 'carMake', title: 'Car Make' },
          { id: 'carModel', title: 'Car Model' },
          { id: 'vin', title: 'VIN' },
          { id: 'manufacturedDate', title: 'Manufactured Date' },
          { id: 'ageOfVehicle', title: 'Age of Vehicle' },
        ],
      });

      // Transform data for CSV
      const csvData = vehicles.map((vehicle) => ({
        ...vehicle,
        manufacturedDate: vehicle.manufacturedDate.toISOString().split('T')[0],
      }));

      // Write CSV file
      await csvWriter.writeRecords(csvData);

      this.logger.log(
        `Successfully exported ${vehicles.length} vehicles to ${filePath}`,
      );

      // Store the result in job data for retrieval
      job.progress(100);
      await job.update({ ...job.data, filePath, completed: true });

      // send notification with job ID for frontend to download
      await this.notification.add('notify', {
        userId: job.data.userId,
        jobId: job.id.toString(),
        type: 'export',
        status: 'completed',
        message: `Export job completed successfully. ${vehicles.length} vehicles exported.`,
        filePath,
      });

      return filePath;
    } catch (err) {
      this.logger.error('Error occurred while exporting vehicles', err);

      // Update job with error status
      await job.update({ ...job.data, completed: false, error: err.message });

      await this.notification.add('notify', {
        userId: job.data.userId,
        jobId: job.id.toString(),
        type: 'export',
        status: 'failed',
        message: `Export job failed: ${err.message}`,
      });
      throw err;
    }
  }
}

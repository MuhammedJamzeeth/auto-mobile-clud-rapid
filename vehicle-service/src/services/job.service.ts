import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import type { Queue } from 'bull';
import { ImportJobData } from 'src/processors/import-job.processor';

@Injectable()
export class JobService {
  constructor(
    @InjectQueue('import-queue') private importQueue: Queue,
    @InjectQueue('export-queue') private exportQueue: Queue,
  ) {}

  async addImportJob(
    filePath: string,
    fileType: 'excel' | 'csv',
    userId?: string,
  ) {
    const jobData: ImportJobData = {
      filePath,
      fileType,
      userId,
    };

    const job = await this.importQueue.add('import-vehicles', jobData, {
      attempts: 3,
      backoff: {
        type: 'exponential', // Increase the delay
        delay: 2000, // Base delay
      },
    });

    return {
      jobId: job.id,
      jobData: job.data,
    };
  }

  async addExportJob(age?: number, userId?: string, exportPath?: string) {
    const jobData = {
      age,
      exportPath,
      userId,
    };
    const job = await this.exportQueue.add('export-vehicles', jobData, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
    return {
      jobId: job.id.toString(),
      message: 'Export job has been queued successfully.',
    };
  }
}

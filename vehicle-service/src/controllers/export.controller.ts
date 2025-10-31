import {
  Controller,
  Res,
  HttpStatus,
  Get,
  Param,
  NotFoundException,
} from '@nestjs/common';
import type { Response } from 'express';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import * as path from 'path';
import * as fs from 'fs';

@Controller('export')
export class ExportController {
  constructor(@InjectQueue('export-queue') private exportQueue: Queue) {}

  @Get('status/:jobId')
  async getExportStatus(@Param('jobId') jobId: string) {
    try {
      const job = await this.exportQueue.getJob(jobId);

      if (!job) {
        throw new NotFoundException('Export job not found');
      }

      const isCompleted = await job.isCompleted();
      const isFailed = await job.isFailed();
      const isActive = await job.isActive();
      const isWaiting = await job.isWaiting();

      return {
        jobId: job.id,
        status: isCompleted
          ? 'completed'
          : isFailed
            ? 'failed'
            : isActive
              ? 'processing'
              : isWaiting
                ? 'queued'
                : 'unknown',
        progress: job.progress(),
        data: job.data,
        failedReason: isFailed ? job.failedReason : null,
      };
    } catch (error) {
      throw new NotFoundException('Export job not found');
    }
  }

  @Get('download/:jobId')
  async downloadExportFile(
    @Param('jobId') jobId: string,
    @Res() res: Response,
  ) {
    try {
      const job = await this.exportQueue.getJob(jobId);

      if (!job) {
        return res.status(HttpStatus.NOT_FOUND).json({
          message: 'Export job not found',
        });
      }

      const isCompleted = await job.isCompleted();
      if (!isCompleted) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: 'Export job is not completed yet',
        });
      }

      const filePath = job.data.filePath;
      if (!filePath || !fs.existsSync(filePath)) {
        return res.status(HttpStatus.NOT_FOUND).json({
          message: 'Export file not found',
        });
      }

      const fileName = path.basename(filePath);

      // Set response headers for file download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${fileName}"`,
      );

      // Stream file to response
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error) {
      console.error('Download error:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Error occurred while downloading file',
        error: error.message,
      });
    }
  }
}

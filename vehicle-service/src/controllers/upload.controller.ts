import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { JobService } from '../services/job.service';
import * as fs from 'fs';
import {
  BadRequestException,
  Body,
  Controller,
  Logger,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

// Configure multer for file storage
const storage = diskStorage({
  destination: './uploads',
  filename: (req, file, callback) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname);
    callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// File filter to accept only CSV and Excel files
const fileFilter = (req: any, file: Express.Multer.File, callback: any) => {
  const allowedMimes = [
    'text/csv',
    'application/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];

  const allowedExtensions = ['.csv', '.xls', '.xlsx'];
  const fileExtension = extname(file.originalname).toLowerCase();

  if (
    allowedMimes.includes(file.mimetype) ||
    allowedExtensions.includes(fileExtension)
  ) {
    callback(null, true);
  } else {
    callback(
      new BadRequestException('Only CSV and Excel files are allowed'),
      false,
    );
  }
};

@Controller('upload')
export class UploadController {
  private readonly logger = new Logger(UploadController.name);
  constructor(private readonly jobService: JobService) {
    // Ensure uploads directory exists

    // process.cwd() return current working dir and join will return the absolute path
    const uploadsDir = join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      // Recursive create all parent directories automatically if they don’t exist.
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
  }

  @Post('csv')
  @UseInterceptors(
    // To extract multipart/form-data
    FileInterceptor('file', {
      storage,
      fileFilter,
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
    }),
  )
  async uploadCsv(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { userId?: string },
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Determine file type based on extension
    const ext = extname(file.originalname).toLowerCase();
    let fileType: 'csv' | 'excel';

    if (ext === '.csv') {
      fileType = 'csv';
    } else if (['.xls', '.xlsx'].includes(ext)) {
      fileType = 'excel';
    } else {
      // Clean up uploaded file
      fs.unlinkSync(file.path);
      throw new BadRequestException('Invalid file type');
    }

    try {
      // Start the import job
      const job = await this.jobService.addImportJob(
        file.path,
        fileType,
        body.userId,
      );

      return {
        success: true,
        message: 'File uploaded and import job started',
        // jobId: job.jobId.toString(),
        // jobData: job.jobData,
        fileName: file.originalname,
        fileSize: file.size,
        fileType,
      };
    } catch (error) {
      this.logger.error(
        `Failed to start import job for file ${file.path}:`,
        error,
      );
      // Clean up file if job creation fails
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      // 400
      throw new BadRequestException(
        `Failed to start import job for file ${file.path}`,
      );
    }
  }
}

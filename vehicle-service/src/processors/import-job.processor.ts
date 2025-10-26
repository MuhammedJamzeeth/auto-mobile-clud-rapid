import { CreateVehicleDto } from 'src/dto/vehicle.dto';
import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { VehicleService } from 'src/services/vehicle.service';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import csvParser from 'csv-parser';

export interface ImportJobData {
  filePath: string;
  fileType: 'excel' | 'csv';
  userId?: string;
}

@Processor('import-queue')
export class ImportJobProcessor {
  private readonly logger = new Logger(ImportJobProcessor.name);

  constructor(private readonly vehicleService: VehicleService) {}

  @Process('import-vehicles')
  async handleImportVehicles(job: Job<ImportJobData>) {
    const { filePath, fileType } = job.data;

    this.logger.debug(
      `Starting import job for file: ${filePath} of type: ${fileType}`,
    );

    // Send notification

    try {
      let vehicleData: any[] = [];

      if (fileType === 'excel') {
        vehicleData = await this.parseExcelFile(filePath);
      } else if (fileType === 'csv') {
        vehicleData = await this.parseCsvFile(filePath);
      }

      // Validate and transform data
      const validVehicles: CreateVehicleDto[] = [];
      const errors: string[] = [];

      for (let i = 0; i < vehicleData.length; i++) {
        try {
         const vehicle = this.transformToVehicleInput(vehicleData[i]);

          if (this.validateVehicleData(vehicle)) {
            validVehicles.push(vehicle);
          } else {
            errors.push(
              `Row ${i + 1}: Invalid data format - ${JSON.stringify(vehicleData[i])}`,
            );
          }
        } catch (e) {
          // Catch unexpected transform/validation errors per-row so the whole job doesn't fail
          this.logger.warn(`Failed to process row ${i + 1}:`, e as Error);
          errors.push(
            `Row ${i + 1}: Exception during processing - ${(e as Error).message}`,
          );
        }
      }

      // Bulk insert valid vehicles
      if (validVehicles.length > 0) {
        await this.vehicleService.bulkCreate(validVehicles);
        this.logger.debug(
          `Successfully imported ${validVehicles.length} vehicles`,
        );
      }

      // Send completion notification

      if (errors.length > 0) {
        this.logger.warn(
          `Import completed with ${errors.length} errors:`,
          errors,
        );
      }

      return {
        imported: validVehicles.length,
        errors: errors.length,
        errorDetails: errors,
      };
    } catch (error) {
      this.logger.error(`Import job failed:`, error);

      // Send notification
    }
  }

  private async parseExcelFile(filePath: string): Promise<any[]> {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const workSheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(workSheet);
  }

  private async parseCsvFile(filePath: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const results: any[] = [];

      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', (error) => reject(error));
    });
  }

  private transformToVehicleInput(row: any): CreateVehicleDto {
    return {
      firstName: row?.first_name || row?.firstName || row['First Name'],
      lastName: row?.last_name || row?.lastName || row['Last Name'],
      email: row?.email || row?.Email,
      carMake: row?.car_make || row?.carMake || row['Car Make'],
      carModel: row?.car_model || row?.carModel || row['Car Model'],
      vin: row?.vin || row?.VIN,
      manufacturedDate:
        row?.manufactured_date ||
        row?.manufacturedDate ||
        row['Manufactured Date'],
    };
  }

  private validateVehicleData(vehicle?: CreateVehicleDto): boolean {
   if (!vehicle) return false;

    // To ensure return type is boolean !! is used
    return !!(
      vehicle.firstName &&
      vehicle.lastName &&
      vehicle.email &&
      vehicle.carMake &&
      vehicle.carModel &&
      vehicle.vin &&
      vehicle.manufacturedDate &&
      // vehicle.vin.length === 17 &&
      this.isValidEmail(vehicle.email) &&
      this.isValidDate(vehicle.manufacturedDate)
    );
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }
}

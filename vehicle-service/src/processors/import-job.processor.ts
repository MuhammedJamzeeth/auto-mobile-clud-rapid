import { Process, Processor } from "@nestjs/bull";
import { Logger } from "@nestjs/common";
import type { Job } from "bull";
import { VehicleService } from "src/services/vehicle.service";

export interface ImportJobData {
    filePath: string;
    fileType: 'excel' | 'csv';
    userId?: string;
}

@Processor('import-queue')
export class ImportJobProcessor {
    private readonly logger = new Logger(ImportJobProcessor.name)

    constructor(
        private readonly vehicleService: VehicleService
    ) {}

    @Process('import-vehicles')
    async handleImportVehicles(job: Job<ImportJobData>) {
        const { filePath, fileType } = job.data;

        
    }

}
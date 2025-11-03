import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateRecordInput } from './dto/create-record.input';
import { UpdateRecordInput } from './dto/update-record.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Record } from './entities/record.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RecordsService {
  private readonly logger = new Logger(RecordsService.name);
  constructor(
    @InjectRepository(Record)
    private readonly recordRepository: Repository<Record>,
  ) {}

  async create(createRecordInput: CreateRecordInput) {
    try {
      const record = this.recordRepository.create(createRecordInput);
      return await this.recordRepository.save(record);
    } catch (error) {
      this.logger.error(
        `Failed to create record: ${error.message}`,
        error.stack,
      );
      if (error.code === '23505') {
        // Unique constraint violation
        throw new BadRequestException('A record with this data already exists');
      }
      throw new InternalServerErrorException('Failed to create record');
    }
  }

  async findAll() {
    try {
      return await this.recordRepository.find({
        order: {
          serviceDate: 'DESC',
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to fetch all records: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to fetch records');
    }
  }

  async findAllPaginated(page: number = 1, limit: number = 100) {
    try {
      if (page < 1) {
        throw new BadRequestException('Page number must be greater than 0');
      }
      if (limit < 1 || limit > 1000) {
        throw new BadRequestException('Limit must be between 1 and 1000');
      }

      const [records, total] = await this.recordRepository.findAndCount({
        take: limit,
        skip: (page - 1) * limit,
        order: {
          serviceDate: 'DESC',
        },
      });

      return {
        records,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(
        `Failed to fetch paginated records: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Failed to fetch paginated records',
      );
    }
  }

  async findByVin(vin: string): Promise<Record[]> {
    try {
      if (!vin || vin.trim().length === 0) {
        throw new BadRequestException('VIN cannot be empty');
      }

      return await this.recordRepository.find({
        where: {
          vin: vin.trim(),
        },
        order: {
          serviceDate: 'DESC',
        },
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(
        `Failed to fetch records by VIN ${vin}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        `Failed to fetch records for VIN: ${vin}`,
      );
    }
  }

  async findOne(id: number) {
    try {
      if (!id || id < 1) {
        throw new BadRequestException('Invalid record ID');
      }

      const record = await this.recordRepository.findOneBy({ id });

      if (!record) {
        throw new NotFoundException(`Record with ID ${id} not found`);
      }

      return record;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(
        `Failed to fetch record with ID ${id}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        `Failed to fetch record with ID: ${id}`,
      );
    }
  }

  async update(id: number, updateRecordInput: UpdateRecordInput) {
    try {
      const record = await this.findOne(id);

      Object.assign(record, updateRecordInput);
      return await this.recordRepository.save(record);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(
        `Failed to update record with ID ${id}: ${error.message}`,
        error.stack,
      );
      if (error.code === '23505') {
        throw new BadRequestException('Update violates unique constraint');
      }
      throw new InternalServerErrorException(
        `Failed to update record with ID: ${id}`,
      );
    }
  }

  async remove(id: number): Promise<Record> {
    try {
      const record = await this.findOne(id);
      return await this.recordRepository.remove(record);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(
        `Failed to remove record with ID ${id}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        `Failed to remove record with ID: ${id}`,
      );
    }
  }
}

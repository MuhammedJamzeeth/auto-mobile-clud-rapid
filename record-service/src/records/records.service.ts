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
    const record = this.recordRepository.create(createRecordInput);
    return await this.recordRepository.save(record);
  }

  async findAll() {
    return await this.recordRepository.find({
      order: {
        serviceDate: 'DESC',
      },
    });
  }

  async findAllPaginated(page: number = 1, limit: number = 100) {
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
    if (!id || id < 1) {
      throw new BadRequestException('Invalid record ID');
    }

    const record = await this.recordRepository.findOneBy({ id });

    if (!record) {
      throw new NotFoundException(`Record with ID ${id} not found`);
    }

    return record;
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
    return await this.recordRepository.delete(id).then(async (result) => {
      if (result.affected && result.affected > 0) {
        return {
          id,
        } as Record;
      } else {
        throw new NotFoundException(`Record with ID ${id} not found`);
      }
    });
  }
}

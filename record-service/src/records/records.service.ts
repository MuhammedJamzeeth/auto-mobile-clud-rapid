import { Injectable, Logger, NotFoundException } from '@nestjs/common';
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

  create(createRecordInput: CreateRecordInput) {
    const record = this.recordRepository.create(createRecordInput);
    return this.recordRepository.save(record);
  }

  async findAll() {
    return await this.recordRepository.find({
      order: {
        serviceDate: 'DESC',
      },
    });
  }

  async findAllPaginated(page: number = 1, limit: number = 100) {
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
    return await this.recordRepository.find({
      where: {
        vin,
      },
      order: {
        serviceDate: 'DESC',
      },
    });
  }

  async findOne(id: number) {
    const record = await this.recordRepository.findOneBy({ id });

    if (!record) {
      throw new NotFoundException(`Record with ID ${id} not found`);
    }

    return record;
  }

  async update(id: number, updateRecordInput: UpdateRecordInput) {
    const record = await this.findOne(id);

    Object.assign(record, updateRecordInput);
    return this.recordRepository.save(record);
  }

  async remove(id: number): Promise<Record> {
    const record = await this.findOne(id);
    return await this.recordRepository.remove(record);
  }
}

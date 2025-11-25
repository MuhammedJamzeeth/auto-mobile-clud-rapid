import {
  Resolver,
  Query,
  Mutation,
  Args,
  Int,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { Record } from '../entities/record.entity';
import { RecordsService } from '../records.service';
import { CreateRecordInput } from '../dto/create-record.input';
import { UpdateRecordInput } from '../dto/update-record.input';
import { PaginatedRecords } from '../dto/paginated-records.dto';
import {
  BadRequestException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
// import { Vehicle } from '../entities/vehicle.reference.entity';

@Resolver(() => Record)
export class RecordsResolver {
  private readonly logger = new Logger(RecordsService.name);
  constructor(private readonly recordsService: RecordsService) {}

  @Mutation(() => Record)
  createRecord(
    @Args('createRecordInput') createRecordInput: CreateRecordInput,
  ) {
    try {
      return this.recordsService.create(createRecordInput);
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

  @Query(() => [Record], { name: 'records' })
  findAll() {
    try {
      return this.recordsService.findAll();
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

  @Query(() => PaginatedRecords, { name: 'recordsPaginated' })
  findAllPaginated(
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, defaultValue: 100 }) limit: number,
  ) {
    try {
      return this.recordsService.findAllPaginated(page, limit);
    } catch (error) {
      this.logger.error(
        `Failed to fetch all records: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to fetch records');
    }
  }

  @Query(() => [Record], { name: 'recordsByVin' })
  findByVin(@Args('vin') vin: string) {
    try {
      return this.recordsService.findByVin(vin);
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

  @Query(() => Record, { name: 'record' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.recordsService.findOne(id);
  }

  @Mutation(() => Record)
  updateRecord(
    @Args('updateRecordInput') updateRecordInput: UpdateRecordInput,
  ) {
    try {
      return this.recordsService.update(
        updateRecordInput.id,
        updateRecordInput,
      );
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(
        `Failed to fetch record with ID ${updateRecordInput.id}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        `Failed to fetch record with ID: ${updateRecordInput.id}`,
      );
    }
  }

  @Mutation(() => Record)
  async removeRecord(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<Record> {
    try {
      return await this.recordsService.remove(id);
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

  // Resolve the vehicle field for Record type
  // This returns a reference that the gateway will use to fetch the full Vehicle
  // @ResolveField(() => Vehicle)
  // vehicle(@Parent() record: Record): { __typename: string; vin: string } {
  //   return {
  //     __typename: 'Vehicle',
  //     vin: record.vin,
  //   };
  // }
}

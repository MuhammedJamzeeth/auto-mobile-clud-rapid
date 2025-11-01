import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { Record } from '../entities/record.entity';
import { RecordsService } from '../records.service';
import { CreateRecordInput } from '../dto/create-record.input';
import { UpdateRecordInput } from '../dto/update-record.input';
import { PaginatedRecords } from '../dto/paginated-records.dto';

@Resolver(() => Record)
export class RecordsResolver {
  constructor(private readonly recordsService: RecordsService) {}

  @Mutation(() => Record)
  createRecord(
    @Args('createRecordInput') createRecordInput: CreateRecordInput,
  ) {
    return this.recordsService.create(createRecordInput);
  }

  @Query(() => [Record], { name: 'records' })
  findAll() {
    return this.recordsService.findAll();
  }

  @Query(() => PaginatedRecords, { name: 'recordsPaginated' })
  findAllPaginated(
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, defaultValue: 100 }) limit: number,
  ) {
    return this.recordsService.findAllPaginated(page, limit);
  }

  @Query(() => [Record], { name: 'recordsByVin' })
  findByVin(@Args('vin') vin: string) {
    return this.recordsService.findByVin(vin);
  }

  @Query(() => Record, { name: 'record' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.recordsService.findOne(id);
  }

  @Mutation(() => Record)
  updateRecord(
    @Args('updateRecordInput') updateRecordInput: UpdateRecordInput,
  ) {
    return this.recordsService.update(updateRecordInput.id, updateRecordInput);
  }

  @Mutation(() => Record)
  async removeRecord(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<Record> {
    return await this.recordsService.remove(id);
  }
}

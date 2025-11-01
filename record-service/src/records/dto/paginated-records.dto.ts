import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Record } from '../entities/record.entity';

@ObjectType()
export class PaginatedRecords {
  @Field(() => [Record])
  records: Record[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;

  @Field(() => Int)
  totalPages: number;
}

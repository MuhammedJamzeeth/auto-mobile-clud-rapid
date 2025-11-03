import { IsNotEmpty, IsNumber } from 'class-validator';
import { CreateRecordInput } from './create-record.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateRecordInput extends PartialType(CreateRecordInput) {
  @Field(() => Int)
  @IsNotEmpty()
  @IsNumber()
  id: number;
}

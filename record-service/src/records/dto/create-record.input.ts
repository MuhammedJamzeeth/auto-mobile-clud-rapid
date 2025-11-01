import { InputType, Int, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

@InputType()
export class CreateRecordInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  vin: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  description: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  serviceType: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  cost?: string;

  @Field(() => Date)
  @IsNotEmpty()
  serviceDate: Date;
}

import { Field, InputType } from '@nestjs/graphql';
import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

@InputType() // For input argument cannot use as a return type
export class CreateVehicleDto {
  @Field()
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  email: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  carMake: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  carModel: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  vin: string;

  @Field()
  @IsNotEmpty()
  @IsDateString()
  manufacturedDate: string;
}

@InputType()
export class UpdateVehicleDto {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  firstName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  lastName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  carMake?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  carModel?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  vin?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  manufacturedDate?: string;
}

@InputType()
export class VehicleFilterDto {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  carMake?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  carModel?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  vin?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  manufacturedDate?: string;
}

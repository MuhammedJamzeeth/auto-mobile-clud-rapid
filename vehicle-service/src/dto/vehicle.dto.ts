import { Field, InputType } from '@nestjs/graphql';
import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

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
  @IsString()
  firstName?: string;

  @Field({ nullable: true })
  @IsString()
  lastName?: string;

  @Field({ nullable: true })
  @IsString()
  email?: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  carMake: string;

  @Field({ nullable: true })
  @IsString()
  carModel?: string;

  @Field({ nullable: true })
  @IsString()
  vin?: string;

  @Field({ nullable: true })
  @IsDateString()
  manufacturedDate?: Date;
}

@InputType()
export class VehicleFilterDto {
  @Field({ nullable: true })
  @IsString()
  search?: string;

  @Field({ nullable: true })
  @IsString()
  carMake?: string;

  @Field({ nullable: true })
  @IsString()
  carModel?: string;

  @Field({ nullable: true })
  @IsString()
  vin?: string;

  @Field({ nullable: true })
  @IsDateString()
  manufacturedDate?: Date;
}

import { Directive, Field, ObjectType } from '@nestjs/graphql';
import { Record } from './record.entity';

@ObjectType('Vehicle')
@Directive('@extends')
@Directive('@key(fields: "vin")')
export class Vehicle {
  @Field(() => String)
  @Directive('@external')
  vin: string;

  // Vehicle can have many records
  @Field(() => [Record])
  records: Record[];
}

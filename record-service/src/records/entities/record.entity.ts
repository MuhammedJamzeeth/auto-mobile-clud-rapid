import { ObjectType, Field, Int, ID } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Vehicle } from './vehicle.reference.entity';

@ObjectType()
@Entity('records')
export class Record {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String)
  @Column()
  vin: string;

  @Field(() => String)
  @Column()
  description: string;

  @Field(() => String)
  @Column()
  serviceType: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  cost: string;

  @Field(() => Date)
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  serviceDate: Date;

  @Field(() => Date)
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Field(() => Vehicle)
  vehicle: Vehicle;
}

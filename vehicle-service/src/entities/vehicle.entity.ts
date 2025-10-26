import {
  Directive,
  Field,
  GraphQLISODateTime,
  ID,
  ObjectType,
} from '@nestjs/graphql';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@ObjectType()
@Directive('@key(fields: "vin")')
@Entity('vehicles')
export class Vehicle {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  firstName: string;

  @Field()
  @Column()
  lastName: string;

  @Field()
  @Column({ unique: true })
  email: string;

  @Field()
  @Column()
  carMake: string;

  @Field()
  @Column()
  carModel: string;

  @Field()
  @Column({ unique: true })
  vin: string;

  @Field(() => GraphQLISODateTime)
  @Column({
    type: 'date',
    transformer: {
      to: (value: Date) => value, // keep value as-is when saving
      from: (value: string | null) => (value ? new Date(value) : null), // convert DB string to Date
    },
  })
  manufacturedDate: Date;

  @Field()
  @Column({ type: 'int' })
  ageOfVehicle: number;

  @BeforeInsert()
  @BeforeUpdate()
  calculateAgeOfVehicle() {
    if (this.manufacturedDate) {
      const age =
        new Date().getFullYear() - this.manufacturedDate.getFullYear();
      this.ageOfVehicle = age > 0 ? age : 0;
    }
  }
}

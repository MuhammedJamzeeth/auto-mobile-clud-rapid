import { Field, ID, ObjectType } from "@nestjs/graphql";
import { BeforeInsert, BeforeUpdate, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@ObjectType()
@Entity('vehicles')
export class Vehicle {
    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id: number

    @Field()
    @Column()
    firstName: string

    @Field()
    @Column()
    lastName: string

    @Field()
    @Column({ unique: true })
    email: string

    @Field()
    @Column()
    carModel: string

    @Field()
    @Column({ unique: true })
    vin: string

    @Field()
    @Column({ type: "date" })
    manufacturedDate: Date

    @Field()
    @Column({ type: 'int' })
    ageOfVehicle: number

    @BeforeInsert()
    @BeforeUpdate()
    calculateAgeOfVehicle() {
        if (this.manufacturedDate) {
            const age = new Date().getFullYear() - this.manufacturedDate.getFullYear();
            this.ageOfVehicle = age > 0 ? age : 0;
        }
    }
}
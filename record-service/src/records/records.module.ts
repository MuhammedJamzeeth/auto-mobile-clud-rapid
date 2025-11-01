import { Module } from '@nestjs/common';
import { RecordsService } from './records.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Record } from './entities/record.entity';
import { RecordsResolver } from './resolvers/records.resolver';
import { VehicleReferenceResolver } from './resolvers/vehicle.reference.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Record])],
  providers: [RecordsResolver, RecordsService, VehicleReferenceResolver],
})
export class RecordsModule {}

import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { Vehicle } from '../entities/vehicle.reference.entity';
import { RecordsService } from '../records.service';
import { Record } from '../entities/record.entity';

// This resolver extends the Vehicle type from the vehicle service
// and adds the records field to the vehicle
@Resolver(() => Vehicle)
export class VehicleReferenceResolver {
  constructor(private readonly recordService: RecordsService) {}

  @ResolveField(() => [Record])
  async records(@Parent() vehicle: Vehicle): Promise<Record[]> {
    return await this.recordService.findByVin(vehicle.vin);
  }
}

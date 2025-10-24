import { Resolver } from "@nestjs/graphql";
import { Vehicle } from "src/entities/vehicle.entity";

@Resolver(() => Vehicle)
export class VehicleResolver {
    
}
import {
  Query,
  Args,
  Field,
  Int,
  ObjectType,
  Resolver,
  ArgsType,
  Mutation,
} from '@nestjs/graphql';
import { UpdateVehicleDto, VehicleFilterDto } from 'src/dto/vehicle.dto';
import { Vehicle } from 'src/entities/vehicle.entity';
import { VehicleService } from 'src/services/vehicle.service';

@ObjectType() // return type
export class PaginatedVehiclesResponse {
  @Field(() => [Vehicle])
  vehicles: Vehicle[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  totalPages: number;
}

@Resolver(() => Vehicle)
export class VehicleResolver {
  constructor(private readonly vehicleService: VehicleService) {}

  @Query(() => PaginatedVehiclesResponse, { name: 'vehicles' })
  async findAll(
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, defaultValue: 100 }) limit: number,
    @Args('filter', { type: () => VehicleFilterDto, nullable: true })
    filter?: VehicleFilterDto,
  ): Promise<PaginatedVehiclesResponse> {
    return this.vehicleService.findAll(page, limit, filter);
  }

  @Query(() => Vehicle, { name: 'vehicle' })
  async findOne(@Args('id', { type: () => Int }) id: number): Promise<Vehicle> {
    return this.vehicleService.findOne(id);
  }

  @Mutation(() => Vehicle)
  async updateVehicle(
    @Args('id', { type: () => Int }) id: number,
    @Args('updateVehicleInput') updateVehicleDto: UpdateVehicleDto,
  ): Promise<Vehicle> {
    return this.vehicleService.update(id, updateVehicleDto);
  }

  @Mutation(() => Vehicle)
  async removeVehicle(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<Vehicle> {
    return this.vehicleService.remove(id);
  }
}

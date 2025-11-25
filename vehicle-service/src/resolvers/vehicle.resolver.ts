import {
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  Query,
  Args,
  Field,
  Int,
  ObjectType,
  Resolver,
  Mutation,
  ResolveReference,
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

@ObjectType()
export class DeleteResultResponse {
  @Field(() => String)
  message: string;
}

@Resolver(() => Vehicle)
export class VehicleResolver {
  private readonly logger = new Logger(VehicleResolver.name);
  constructor(private readonly vehicleService: VehicleService) {}

  // 2.
  // @ResolveReference()
  // resolveReference(reference: {
  //   __typename: string;
  //   vin: string;
  // }): Promise<Vehicle> {
  //   return this.vehicleService.findByVin(reference.vin);
  // }

  @Query(() => PaginatedVehiclesResponse, { name: 'vehicles' })
  async findAll(
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, defaultValue: 100 }) limit: number,
    @Args('filter', { type: () => VehicleFilterDto, nullable: true })
    filter?: VehicleFilterDto,
  ): Promise<PaginatedVehiclesResponse> {
    try {
      return this.vehicleService.findAll(page, limit, filter);
    } catch (error) {
      this.logger.error(
        `Failed to fetch vehicles: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to fetch vehicles');
    }
  }

  @Query(() => Vehicle, { name: 'vehicle' })
  async findOne(@Args('id', { type: () => Int }) id: number): Promise<Vehicle> {
    try {
      return this.vehicleService.findOne(id);
    } catch (error) {
      this.logger.error(
        `Failed to find the vehicle id of: ${id}, error: ${error.message}`,
      );

      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch vehicle');
    }
  }

  @Query(() => Vehicle, { name: 'vehicleByVin' })
  async findByVin(
    @Args('vin', { type: () => String }) vin: string,
  ): Promise<Vehicle> {
    try {
      return this.vehicleService.findByVin(vin);
    } catch (error) {
      this.logger.error(
        `Failed to find the vehicle vin of: ${vin}, error: ${error.message}`,
      );
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch vehicle');
    }
  }

  @Mutation(() => Vehicle)
  async updateVehicle(
    @Args('id', { type: () => Int }) id: number,
    @Args('updateVehicleInput') updateVehicleDto: UpdateVehicleDto,
  ): Promise<Vehicle> {
    try {
      return await this.vehicleService.update(id, updateVehicleDto);
    } catch (error) {
      this.logger.error(
        `Failed to update the vehicle id of: ${id}, error: ${error.message}`,
      );

      throw new InternalServerErrorException('Failed to update vehicle');
    }
  }

  @Mutation(() => DeleteResultResponse)
  async removeVehicle(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<DeleteResultResponse> {
    try {
      return await this.vehicleService.remove(id);
    } catch (error) {
      this.logger.error(
        `Failed to remove the vehicle id of: ${id}, error: ${error.message}`,
      );
      throw new InternalServerErrorException('Failed to remove vehicle');
    }
  }
}

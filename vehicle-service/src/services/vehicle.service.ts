import { InjectRepository } from '@nestjs/typeorm';
import { CreateVehicleDto } from 'src/dto/vehicle.dto';
import { Vehicle } from 'src/entities/vehicle.entity';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class VehicleService {
  constructor(
    @InjectRepository(Vehicle) private vehicleRepository: Repository<Vehicle>,
  ) {}

  async bulkCreate(vehicles: CreateVehicleDto[]) {
    const vehicleEntities = vehicles.map((vehicleData) => {
      const vehicle = this.vehicleRepository.create({
        ...vehicleData,
        manufacturedDate: new Date(vehicleData.manufacturedDate),
      });
      return vehicle;
    });

    return await this.vehicleRepository.save(vehicleEntities);
  }
}

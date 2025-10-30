import { InjectRepository } from '@nestjs/typeorm';
import {
  CreateVehicleDto,
  UpdateVehicleDto,
  VehicleFilterDto,
} from 'src/dto/vehicle.dto';
import { Vehicle } from 'src/entities/vehicle.entity';
import { Repository } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';

export interface PaginatedVehicles {
  vehicles: Vehicle[];
  total: number;
  page: number;
  totalPages: number;
}

@Injectable()
export class VehicleService {
  constructor(
    @InjectRepository(Vehicle) private vehicleRepository: Repository<Vehicle>,
  ) {}

  async create(createVehicleDto: CreateVehicleDto): Promise<Vehicle> {
    const vehicle = this.vehicleRepository.create({
      ...createVehicleDto,
      manufacturedDate: new Date(createVehicleDto.manufacturedDate),
    });
    return await this.vehicleRepository.save(vehicle);
  }

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

  async findAll(
    page: number = 1,
    limit: number = 100,
    filter?: VehicleFilterDto,
  ): Promise<PaginatedVehicles> {
    const queryBuilder = this.vehicleRepository.createQueryBuilder('vehicle');

    // Apply filters
    if (filter?.search) {
      queryBuilder.where(
        'vehicle.carModel LIKE :search OR vehicle.carMake LIKE :search OR vehicle.firstName LIKE :search OR vehicle.lastName LIKE :search',
        { search: `%${filter.search}%` },
      );
    }

    if (filter?.carMake) {
      queryBuilder.andWhere('vehicle.carMake LIKE :carMake', {
        carMake: `%${filter.carMake}%`,
      });
    }

    if (filter?.carModel) {
      queryBuilder.andWhere('vehicle.carModel LIKE :carModel', {
        carModel: `%${filter.carModel}%`,
      });
    }

    // Order by manufacturedDate ascending
    queryBuilder.orderBy('vehicle.manufacturedDate', 'ASC');

    // Apply pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [vehicles, total] = await queryBuilder.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      vehicles,
      total,
      page,
      totalPages,
    };
  }

  async findVehiclesByAge(age?: number): Promise<Vehicle[]> {
    const queryBuilder = this.vehicleRepository.createQueryBuilder('vehicle');

    if (age !== undefined) {
      const currentDate = new Date();
      const targetDate = new Date(
        currentDate.getFullYear() - age,
        currentDate.getMonth(),
        currentDate.getDate(),
      );
      queryBuilder.where('vehicle.manufacturedDate <= :targetDate', {
        targetDate: targetDate.toISOString().split('T')[0],
      });
    }
    return await queryBuilder.getMany();
  }

  async findOne(id: number): Promise<Vehicle> {
    const vehicle = await this.vehicleRepository.findOne({
      where: { id },
    });
    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID ${id} not found`);
    }
    return vehicle;
  }

  async findByVin(vin: string): Promise<Vehicle> {
    const vehicle = await this.vehicleRepository.findOne({ where: { vin } });
    if (!vehicle) {
      throw new NotFoundException(`Vehicle with VIN ${vin} not found`);
    }
    return vehicle;
  }

  async update(
    id: number,
    updateVehicleDto: UpdateVehicleDto,
  ): Promise<Vehicle> {
    const vehicle = await this.findOne(id);

    // Partial update, it will only update the fields provided in upddateVehicleDto
    Object.assign(vehicle, updateVehicleDto);
    return await this.vehicleRepository.save(vehicle);
  }

  async remove(id: number): Promise<Vehicle> {
    const vehicle = await this.findOne(id);
    return await this.vehicleRepository.remove(vehicle);
  }
}

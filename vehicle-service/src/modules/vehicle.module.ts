import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Vehicle } from "src/entities/vehicle.entity";
import { NotificationGateway } from "src/gateways/notification.gateway";

@Module({
    imports: [
        TypeOrmModule.forFeature([Vehicle])
    ],
    providers: [
        NotificationGateway
    ],
    exports: [

    ]
})
export class VehicleModule {}
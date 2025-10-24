import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vehicle } from './entities/vehicle.entity';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { VehicleModule } from './modules/vehicle.module';
import { BullModule } from '@nestjs/bull';


@Module({
  imports: [
   TypeOrmModule.forRoot({
    type: "postgres",
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'jamsy',
    database: process.env.DB_NAME || 'vehicle-service',
    entities: [Vehicle],
    synchronize: process.env.NODE_ENV !== 'production',
   }),
  //  GraphQLModule.forRoot<ApolloDriverConfig>({
  //   driver: ApolloDriver,
  //   autoSchemaFile: 'schema.gql',
  //   playground: true,
  //  }),
   BullModule.forRoot({
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379')
    }
   }),
   VehicleModule

  ],
  controllers: [],
  providers: [],
})

export class AppModule {}

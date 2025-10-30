import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloGatewayDriver, ApolloGatewayDriverConfig } from '@nestjs/apollo';
import { IntrospectAndCompose } from '@apollo/gateway';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloGatewayDriverConfig>({
      driver: ApolloGatewayDriver,
      gateway: {
        supergraphSdl: new IntrospectAndCompose({
          subgraphs: [
            {
              name: 'vehicle',
              url:
                process.env.VEHICLE_GRAPHQL || 'http://localhost:3000/graphql',
            },
          ],
        }),
      },
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

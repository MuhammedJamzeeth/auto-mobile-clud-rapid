import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // to type convert
      whitelist: true, // remove object properties not in the DTO
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

import { NestFactory } from '@nestjs/core';
import IngredientModule from './ingredient.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const service = await NestFactory.createMicroservice<MicroserviceOptions>(IngredientModule, {
    transport: Transport.TCP,
    options: {
      port: parseInt(process.env.INGREDIENT_MICROSERVICE_TCP_PORT!),
    },
  });
  await service.listen();
}
bootstrap();

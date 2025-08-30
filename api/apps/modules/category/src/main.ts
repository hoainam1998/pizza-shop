import { NestFactory } from '@nestjs/core';
import { CategoryModule } from './category.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(CategoryModule, {
    transport: Transport.TCP,
    options: {
      port: parseInt(process.env.CATEGORY_MICROSERVICE_TCP_PORT!),
    },
  });
  await app.listen();
}
bootstrap();

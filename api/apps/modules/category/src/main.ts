import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import CategoryModule from './category.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(CategoryModule, {
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: parseInt(process.env.CATEGORY_MICROSERVICE_TCP_PORT!),
    },
  });
  await app
    .listen()
    .then(() =>
      Logger.log(`Category module started at port: ${process.env.CATEGORY_MICROSERVICE_TCP_PORT}`, CategoryModule.name),
    );
}
bootstrap();

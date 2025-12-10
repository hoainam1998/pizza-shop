import { Logger } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { NestFactory } from '@nestjs/core';
import ProductModule from './product.module';

async function bootstrap() {
  const service = await NestFactory.createMicroservice<MicroserviceOptions>(ProductModule, {
    transport: Transport.TCP,
    options: {
      port: parseInt(process.env.PRODUCT_MICROSERVICE_TCP_PORT!),
    },
  });
  await service
    .listen()
    .then(() =>
      Logger.log(`Product module started at port: ${process.env.PRODUCT_MICROSERVICE_TCP_PORT}`, ProductModule.name),
    );
}
bootstrap();

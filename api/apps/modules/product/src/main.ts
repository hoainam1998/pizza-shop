import { NestFactory } from '@nestjs/core';
import ProductModule from './product.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const service = await NestFactory.createMicroservice<MicroserviceOptions>(ProductModule, {
    transport: Transport.TCP,
    options: {
      port: parseInt(process.env.PRODUCT_MICROSERVICE_TCP_PORT!),
    },
  });
  await service.listen();
}
bootstrap();

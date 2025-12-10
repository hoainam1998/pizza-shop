import { Logger } from '@nestjs/common';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { NestFactory } from '@nestjs/core';
import UserModule from './user.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(UserModule, {
    transport: Transport.TCP,
    options: {
      port: parseInt(process.env.USER_MICROSERVICE_TCP_PORT!),
    },
  });
  await app
    .listen()
    .then(() => Logger.log(`User module started at port: ${process.env.USER_MICROSERVICE_TCP_PORT}`, UserModule.name));
}
bootstrap();

import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import SocketModule from './socket.module';
import { ConfigService } from '@nestjs/config';
import { SocketIoAdapter } from '@share/libs/socket/socket-io-adapter';
import UserCachingService from '@share/libs/caching/user/user.service';
import EventsGateway from '@share/libs/socket/event-socket.gateway';

async function bootstrap() {
  const service = await NestFactory.createMicroservice<MicroserviceOptions>(SocketModule, {
    transport: Transport.TCP,
    options: {
      port: parseInt(process.env.SOCKET_MICROSERVICE_TCP_PORT!),
    },
  });
  const configService = service.get(ConfigService);
  const userCachingService = service.get(UserCachingService);
  const eventsGateway = service.get(EventsGateway);
  service.useWebSocketAdapter(new SocketIoAdapter(service, configService, userCachingService, eventsGateway));
  await service
    .listen()
    .then(() => Logger.log(`Socket module started at port: ${process.env.SOCKET_MICROSERVICE_TCP_PORT!}`));
}
bootstrap();

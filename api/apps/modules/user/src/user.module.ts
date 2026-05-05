import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, ClientProvider, Transport } from '@nestjs/microservices';
import UserController from './user.controller';
import UserService from './user.service';
import ShareModule from '@share/module';
import LoggingModule from '@share/libs/logging/logging.module';
import { SOCKET_SERVICE } from '@share/di-token';

@Module({
  imports: [
    ShareModule,
    LoggingModule,
    ClientsModule.registerAsync([
      {
        useFactory: (configService: ConfigService): ClientProvider => {
          return {
            transport: Transport.TCP,
            options: {
              port: parseInt(configService.get<string>('ports.SOCKET_MICROSERVICE_TCP_PORT')!),
            },
          };
        },
        inject: [ConfigService],
        name: SOCKET_SERVICE,
      },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export default class UserModule {}

import { Module } from '@nestjs/common';
import { ClientProvider, ClientsModule, Transport } from '@nestjs/microservices';
import UserController from './user.controller';
import UserService from './user.service';
import { USER_SERVICE } from '@share/di-token';
import ShareModule from '@share/module';
import { ConfigService } from '@nestjs/config';
import LoggingModule from '@share/libs/logging/logging.module';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        useFactory: (configService: ConfigService): ClientProvider => {
          return {
            transport: Transport.TCP,
            options: {
              port: parseInt(configService.get<string>('ports.USER_MICROSERVICE_TCP_PORT')!),
            },
          };
        },
        inject: [ConfigService],
        name: USER_SERVICE,
      },
    ]),
    ShareModule,
    LoggingModule,
  ],
  controllers: [UserController],
  providers: [UserService],
})
export default class UserModule {}

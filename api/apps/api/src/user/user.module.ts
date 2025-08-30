import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import UserController from './user.controller';
import UserService from './user.service';
import { USER_SERVICE } from 'apps/share/di-token';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: USER_SERVICE,
        transport: Transport.TCP,
        options: {
          port: parseInt(process.env.USER_MICROSERVICE_TCP_PORT!),
        },
      },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export default class UserModule {}

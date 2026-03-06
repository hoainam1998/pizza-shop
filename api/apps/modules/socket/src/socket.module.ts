import { Module } from '@nestjs/common';
import SocketController from './socket.controller';
import SocketService from './socket.service';
import EventsModule from '@share/libs/socket/event-socket.module';
import EnvironmentConfigModule from '@share/environment-config/environment-config.module';

@Module({
  imports: [EventsModule, EnvironmentConfigModule],
  controllers: [SocketController],
  providers: [SocketService],
})
export default class SocketModule {}

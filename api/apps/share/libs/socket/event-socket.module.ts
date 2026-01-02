import { Module } from '@nestjs/common';
import { EventsGateway } from './event-socket.gateway';

@Module({
  providers: [EventsGateway],
  exports: [EventsGateway],
})
export default class EventsModule {}

import { Test, TestingModule } from '@nestjs/testing';
import EventsModule from '@share/libs/socket/event-socket.module';
import SocketController from '../socket.controller';
import SocketService from '../socket.service';
import ShareModule from '@share/module';

export default (): Promise<TestingModule> => {
  return Test.createTestingModule({
    imports: [EventsModule, ShareModule],
    controllers: [SocketController],
    providers: [SocketService],
  }).compile();
};

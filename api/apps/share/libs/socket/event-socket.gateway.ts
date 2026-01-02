import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

type ConnectedPayloadType = {
  userId: string;
};

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway {
  static wsInstances = new Map<string, Socket>();

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('connected')
  connected(@MessageBody() data: ConnectedPayloadType, @ConnectedSocket() client: Socket): void {
    EventsGateway.wsInstances.set(data.userId, client);
  }

  refreshCurrentInfo(userId: string) {
    EventsGateway.wsInstances.get(userId)?.emit('refresh');
  }
}

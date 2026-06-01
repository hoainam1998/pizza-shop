import { WebSocketGateway } from '@nestjs/websockets';
import SocketInstances from '../socket-instances/socket-instances';
import socketEventNames from '@share/constants/socket-event-names';

@WebSocketGateway()
export default class UserNotificationEventsGateway {
  updateUserComplete(userId: string): void {
    let socket = SocketInstances.Admin.getSocketClient(userId);
    if (!socket) {
      socket = SocketInstances.Client.getSocketClient(userId);
    }
    socket?.emit(socketEventNames.UPDATE_USER_INFO, {});
  }

  refreshUserPagination(): void {
    SocketInstances.Admin.getAllSocketClient().forEach((socket) => {
      socket.emit(socketEventNames.REFRESH_USER_PAGINATION, {});
    });
  }
}

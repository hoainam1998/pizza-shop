import { Logger } from '@nestjs/common';
import { ConnectedSocket, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import type { DataChartAddedType, ConnectedPayloadType, SocketExtended } from '@share/interfaces';
import ReportCachingService from '@share/libs/caching/report/report.service';
import UserCachingService from '@share/libs/caching/user/user.service';
import LoggingService from '@share/libs/logging/logging.service';
import SocketInstances from './socket-instances/socket-instances';
import socketEventNames from '@share/constants/socket-event-names';
import { VIEW } from '@share/enums';

@WebSocketGateway()
export default class EventsGateway {
  constructor(
    private readonly reportCachingService: ReportCachingService,
    private readonly userCachingService: UserCachingService,
    private readonly logger: LoggingService,
  ) {}

  @WebSocketServer()
  server: Server;

  connected(data: ConnectedPayloadType, client: SocketExtended): void {
    SocketInstances.addSocketClient(data, client);

    if (data.view === VIEW.ADMIN) {
      void this.reportCachingService.addReportViewer(data.userId);
    }

    const removeSocketClient = async () => {
      if (data.view === VIEW.ADMIN) {
        await this.reportCachingService
          .removeReportViewer(data.userId)
          .then(() => SocketInstances.Admin.removeSocketClient(data.userId))
          .catch((error) =>
            this.logger.log(error.message as string, this.reportCachingService.removeReportViewer.name),
          );
      } else {
        SocketInstances.Client.removeSocketClient(data.userId);
      }
    };

    client.on(socketEventNames.DISCONNECT, async (reason) => {
      await removeSocketClient();
      Logger.warn(`Disconnect with ${reason} - sender: ${client.requester.userId}`, 'Socket Event Gateway');
    });
  }

  @SubscribeMessage(socketEventNames.LOGOUT)
  logout(@ConnectedSocket() client: SocketExtended): void {
    const userId = client['requester'].userId as string;
    this.userCachingService.logoutPublish(userId);
    client.disconnect();
  }

  refreshCurrentInfo(userId: string): void {
    SocketInstances.Client.getSocketClient(userId)?.emit(socketEventNames.REFRESH);
  }

  addChartData(payload: DataChartAddedType): void {
    void this.reportCachingService
      .getAllReportViewer()
      .then(function (userIds) {
        userIds.forEach(function (userId) {
          SocketInstances.Admin.getSocketClient(userId)?.emit(socketEventNames.ADD_DATA_CHART, payload);
        });
      })
      .catch((error) => this.logger.error(error.message as string, this.reportCachingService.getAllReportViewer.name));
  }

  updateUserComplete(userId: string): void {
    SocketInstances.Admin.getSocketClient(userId)?.emit(socketEventNames.UPDATE_USER_INFO, {});
  }
}

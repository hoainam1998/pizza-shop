import { Logger } from '@nestjs/common';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import type { DataChartAddedType, ConnectedPayloadType } from '@share/interfaces';
import ReportCachingService from '../caching/report/report.service';
import LoggingService from '../logging/logging.service';
import SocketInstances from './socket-instances/socket-instances';
import socketEventNames from '@share/constants/socket-event-names';
import { VIEW } from '@share/enums';

@WebSocketGateway()
export default class EventsGateway {
  constructor(
    private readonly reportCachingService: ReportCachingService,
    private readonly logger: LoggingService,
  ) {}

  @WebSocketServer()
  server: Server;

  @SubscribeMessage(socketEventNames.CONNECTED)
  connected(@MessageBody() data: ConnectedPayloadType, @ConnectedSocket() client: Socket): void {
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
      }
    };

    client.on(socketEventNames.DISCONNECT, async (reason) => {
      await removeSocketClient();
      Logger.warn(`Disconnect with ${reason}`, 'Socket Event Gateway');
    });
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
}

import { WebSocketGateway } from '@nestjs/websockets';
import SocketInstances from '../socket-instances/socket-instances';
import socketEventNames from '@share/constants/socket-event-names';
import type { DataChartAddedType } from '@share/interfaces';
import ReportCachingService from '@share/libs/caching/report/report.service';
import LoggingService from '@share/libs/logging/logging.service';

@WebSocketGateway()
export default class ProductNotificationEventsGateway {
  constructor(
    private readonly reportCachingService: ReportCachingService,
    private readonly logger: LoggingService,
  ) {}

  refreshProductInfo(userId: string): void {
    SocketInstances.Client.getSocketClient(userId)?.emit(socketEventNames.REFRESH);
  }

  refreshAllProducts(): void {
    SocketInstances.Client.getAllSocketClient().forEach((socket) => {
      socket.emit(socketEventNames.REFRESH_ALL_PRODUCT);
    });
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

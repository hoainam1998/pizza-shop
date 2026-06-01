import { Injectable } from '@nestjs/common';
import ReportCachingService from '@share/libs/caching/report/report.service';
import { Logger } from '@nestjs/common';
import type { ConnectedPayloadType, SocketExtended } from '@share/interfaces';
import SocketInstances from '../socket-instances/socket-instances';
import socketEventNames from '@share/constants/socket-event-names';
import { VIEW } from '@share/enums';
import LoggingService from '@share/libs/logging/logging.service';

@Injectable()
export default class SocketConnected {
  constructor(
    private readonly reportCachingService: ReportCachingService,
    private readonly logger: LoggingService,
  ) {}

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
}

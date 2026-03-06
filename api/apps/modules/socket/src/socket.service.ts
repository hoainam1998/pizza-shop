import { Injectable } from '@nestjs/common';
import { DataChartAddedType } from '@share/interfaces';
import EventsGateway from '@share/libs/socket/event-socket.gateway';

@Injectable()
export default class SocketService {
  constructor(private readonly socketGateway: EventsGateway) {}

  addDataChart(payload: DataChartAddedType): void {
    this.socketGateway.addChartData(payload);
  }

  refreshProductInfo(userId: string): void {
    this.socketGateway.refreshCurrentInfo(userId);
  }
}

import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import SocketService from './socket.service';
import { addDataChartEventPattern, refreshProductInfoPattern } from '@share/pattern';
import type { DataChartAddedType } from '@share/interfaces';

@Controller()
export default class SocketController {
  constructor(private readonly socketService: SocketService) {}

  @EventPattern(addDataChartEventPattern)
  addDataChart(payload: DataChartAddedType): void {
    this.socketService.addDataChart(payload);
  }

  @EventPattern(refreshProductInfoPattern)
  refreshProductInfo(userId: string): void {
    this.socketService.refreshProductInfo(userId);
  }
}

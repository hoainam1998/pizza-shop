import { Injectable } from '@nestjs/common';
import { DataChartAddedType } from '@share/interfaces';
import UserNotificationEventsGateway from '@share/libs/socket/event-socket/user-notification';
import ProductNotificationEventsGateway from '@share/libs/socket/event-socket/product-notification';

@Injectable()
export default class SocketService {
  constructor(
    private readonly productNotificationEventsGateway: ProductNotificationEventsGateway,
    private readonly userNotificationEventsGateway: UserNotificationEventsGateway,
  ) {}

  addDataChart(payload: DataChartAddedType): void {
    this.productNotificationEventsGateway.addChartData(payload);
  }

  refreshProductInfo(userId: string): void {
    this.productNotificationEventsGateway.refreshProductInfo(userId);
  }

  refreshAllProducts(): void {
    this.productNotificationEventsGateway.refreshAllProducts();
  }

  refreshUserPagination(): void {
    this.userNotificationEventsGateway.refreshUserPagination();
  }

  updateUserComplete(userId: string): void {
    this.userNotificationEventsGateway.updateUserComplete(userId);
  }
}

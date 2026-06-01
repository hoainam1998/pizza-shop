import ProductNotificationEventsGateway from '@share/libs/socket/event-socket/product-notification';
import startUp from './pre-setup';
import SocketInstances from '../socket-instances/socket-instances';
import socketEventNames from '@share/constants/socket-event-names';
import './socket-instances-storage-mock';

let productNotificationEventsGateway: ProductNotificationEventsGateway;
let close: () => Promise<void>;

const socket: any = {
  emit: jest.fn(),
};

beforeAll(async () => {
  const moduleRef = await startUp();
  productNotificationEventsGateway = moduleRef.get(ProductNotificationEventsGateway);
  close = () => moduleRef.close();
});

afterAll(async () => {
  await close();
});

describe('refresh all products', () => {
  it('refresh all products success', () => {
    expect.hasAssertions();
    const getAllSocketClient = jest.spyOn(SocketInstances.Client, 'getAllSocketClient').mockReturnValue([socket]);
    const refreshAllProducts = jest.spyOn(productNotificationEventsGateway, 'refreshAllProducts');
    productNotificationEventsGateway.refreshAllProducts();
    expect(refreshAllProducts).toHaveBeenCalledTimes(1);
    expect(getAllSocketClient).toHaveBeenCalledTimes(1);
    expect(socket.emit).toHaveBeenCalledTimes(1);
    expect(socket.emit).toHaveBeenCalledWith(socketEventNames.REFRESH_ALL_PRODUCT);
  });

  it('refresh all products failed', () => {
    expect.hasAssertions();
    const getAllSocketClient = jest.spyOn(SocketInstances.Client, 'getAllSocketClient').mockReturnValue([]);
    const refreshAllProducts = jest.spyOn(productNotificationEventsGateway, 'refreshAllProducts');
    productNotificationEventsGateway.refreshAllProducts();
    expect(refreshAllProducts).toHaveBeenCalledTimes(1);
    expect(getAllSocketClient).toHaveBeenCalledTimes(1);
    expect(socket.emit).not.toHaveBeenCalled();
  });
});

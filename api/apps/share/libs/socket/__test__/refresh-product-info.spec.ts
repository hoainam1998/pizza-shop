import ProductNotificationEventsGateway from '@share/libs/socket/event-socket/product-notification';
import startUp from './pre-setup';
import SocketInstances from '../socket-instances/socket-instances';
import socketEventNames from '@share/constants/socket-event-names';
import './socket-instances-storage-mock';

const userId = Date.now().toString();
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

describe('refresh product info', () => {
  it('refresh product info success', () => {
    expect.hasAssertions();
    const getSocketClient = jest.spyOn(SocketInstances.Client, 'getSocketClient').mockReturnValue(socket);
    const refreshProductInfo = jest.spyOn(productNotificationEventsGateway, 'refreshProductInfo');
    productNotificationEventsGateway.refreshProductInfo(userId);
    expect(refreshProductInfo).toHaveBeenCalledTimes(1);
    expect(refreshProductInfo).toHaveBeenCalledWith(userId);
    expect(getSocketClient).toHaveBeenCalledTimes(1);
    expect(getSocketClient).toHaveBeenCalledWith(userId);
    expect(socket.emit).toHaveBeenCalledTimes(1);
    expect(socket.emit).toHaveBeenCalledWith(socketEventNames.REFRESH);
  });

  it('refresh product info failed', () => {
    expect.hasAssertions();
    const getSocketClient = jest.spyOn(SocketInstances.Client, 'getSocketClient').mockReturnValue(undefined);
    const refreshProductInfo = jest.spyOn(productNotificationEventsGateway, 'refreshProductInfo');
    productNotificationEventsGateway.refreshProductInfo(userId);
    expect(refreshProductInfo).toHaveBeenCalledTimes(1);
    expect(refreshProductInfo).toHaveBeenCalledWith(userId);
    expect(getSocketClient).toHaveBeenCalledTimes(1);
    expect(getSocketClient).toHaveBeenCalledWith(userId);
    expect(socket.emit).not.toHaveBeenCalled();
  });
});

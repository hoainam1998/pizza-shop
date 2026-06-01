import SocketController from '../socket.controller';
import SocketService from '../socket.service';
import ProductNotificationEventsGateway from '@share/libs/socket/event-socket/product-notification';
import startUp from './pre-setup';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';

let socketController: SocketController;
let socketService: SocketService;
let productNotificationEventsGateway: ProductNotificationEventsGateway;
const userId: string = Date.now().toString();

beforeAll(async () => {
  const moduleRef = await startUp();
  socketController = moduleRef.get(SocketController);
  socketService = moduleRef.get(SocketService);
  productNotificationEventsGateway = moduleRef.get(ProductNotificationEventsGateway);
});

describe('refresh product info', () => {
  it('refresh product info success', () => {
    expect.hasAssertions();
    const refreshCurrentInfoSocketGateway = jest
      .spyOn(productNotificationEventsGateway, 'refreshProductInfo')
      .mockImplementation(jest.fn);
    const refreshProductInfoService = jest.spyOn(socketService, 'refreshProductInfo');
    const refreshProductInfoController = jest.spyOn(socketController, 'refreshProductInfo');
    socketController.refreshProductInfo(userId);
    expect(refreshProductInfoController).toHaveBeenCalledTimes(1);
    expect(refreshProductInfoService).toHaveBeenCalledTimes(1);
    expect(refreshProductInfoService).toHaveBeenCalledWith(userId);
    expect(refreshCurrentInfoSocketGateway).toHaveBeenCalledTimes(1);
    expect(refreshCurrentInfoSocketGateway).toHaveBeenCalledWith(userId);
  });

  it('refresh product info failed with unknown error', () => {
    expect.hasAssertions();
    const refreshCurrentInfoSocketGateway = jest
      .spyOn(productNotificationEventsGateway, 'refreshProductInfo')
      .mockImplementation(() => {
        throw UnknownError;
      });
    const refreshProductInfoService = jest.spyOn(socketService, 'refreshProductInfo');
    const refreshProductInfoController = jest.spyOn(socketController, 'refreshProductInfo');
    expect(() => socketController.refreshProductInfo(userId)).toThrow(UnknownError);
    expect(refreshProductInfoController).toHaveBeenCalledTimes(1);
    expect(refreshProductInfoService).toHaveBeenCalledTimes(1);
    expect(refreshProductInfoService).toHaveBeenCalledWith(userId);
    expect(refreshCurrentInfoSocketGateway).toHaveBeenCalledTimes(1);
    expect(refreshCurrentInfoSocketGateway).toHaveBeenCalledWith(userId);
  });
});

import SocketController from '../socket.controller';
import SocketService from '../socket.service';
import ProductNotificationEventsGateway from '@share/libs/socket/event-socket/product-notification';
import startUp from './pre-setup';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';

let socketController: SocketController;
let socketService: SocketService;
let productNotificationEventsGateway: ProductNotificationEventsGateway;

beforeAll(async () => {
  const moduleRef = await startUp();
  socketController = moduleRef.get(SocketController);
  socketService = moduleRef.get(SocketService);
  productNotificationEventsGateway = moduleRef.get(ProductNotificationEventsGateway);
});

describe('refresh all products', () => {
  it('refresh all products success', () => {
    expect.hasAssertions();
    const refreshAllProductsSocket = jest
      .spyOn(productNotificationEventsGateway, 'refreshAllProducts')
      .mockImplementation(jest.fn);
    const refreshAllProductsService = jest.spyOn(socketService, 'refreshAllProducts');
    const refreshAllProductsController = jest.spyOn(socketController, 'refreshAllProducts');
    socketController.refreshAllProducts();
    expect(refreshAllProductsController).toHaveBeenCalledTimes(1);
    expect(refreshAllProductsService).toHaveBeenCalledTimes(1);
    expect(refreshAllProductsSocket).toHaveBeenCalledTimes(1);
  });

  it('refresh all products failed with unknown error', () => {
    expect.hasAssertions();
    const refreshAllProductsSocket = jest
      .spyOn(productNotificationEventsGateway, 'refreshAllProducts')
      .mockImplementation(() => {
        throw UnknownError;
      });
    const refreshAllProductsService = jest.spyOn(socketService, 'refreshAllProducts');
    const refreshAllProductsController = jest.spyOn(socketController, 'refreshAllProducts');
    expect(() => socketController.refreshAllProducts()).toThrow(UnknownError);
    expect(refreshAllProductsController).toHaveBeenCalledTimes(1);
    expect(refreshAllProductsService).toHaveBeenCalledTimes(1);
    expect(refreshAllProductsSocket).toHaveBeenCalledTimes(1);
  });
});

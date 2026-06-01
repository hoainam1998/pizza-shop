import SocketController from '../socket.controller';
import SocketService from '../socket.service';
import ProductNotificationEventsGateway from '@share/libs/socket/event-socket/product-notification';
import startUp from './pre-setup';
import type { DataChartAddedType } from '@share/interfaces';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';

let socketController: SocketController;
let socketService: SocketService;
let productNotificationEventsGateway: ProductNotificationEventsGateway;
const payload: DataChartAddedType = {
  revenue: 0,
  capital: 0,
};

beforeAll(async () => {
  const moduleRef = await startUp();
  socketController = moduleRef.get(SocketController);
  socketService = moduleRef.get(SocketService);
  productNotificationEventsGateway = moduleRef.get(ProductNotificationEventsGateway);
});

describe('add data chart', () => {
  it('add data chart success', (done) => {
    expect.hasAssertions();
    const addChartDataSocketGateway = jest
      .spyOn(productNotificationEventsGateway, 'addChartData')
      .mockImplementation(jest.fn);
    const addDataChartService = jest.spyOn(socketService, 'addDataChart');
    const addDataChartController = jest.spyOn(socketController, 'addDataChart');
    socketController.addDataChart(payload);
    expect(addDataChartController).toHaveBeenCalledTimes(1);
    expect(addDataChartService).toHaveBeenCalledTimes(1);
    expect(addDataChartService).toHaveBeenCalledWith(payload);
    expect(addChartDataSocketGateway).toHaveBeenCalledTimes(1);
    expect(addChartDataSocketGateway).toHaveBeenCalledWith(payload);
    done();
  });

  it('add data chart failed with unknown error', (done) => {
    expect.hasAssertions();
    const addChartDataSocketGateway = jest
      .spyOn(productNotificationEventsGateway, 'addChartData')
      .mockImplementation(() => {
        throw UnknownError;
      });
    const addDataChartService = jest.spyOn(socketService, 'addDataChart');
    const addDataChartController = jest.spyOn(socketController, 'addDataChart');
    expect(() => socketController.addDataChart(payload)).toThrow(UnknownError);
    expect(addDataChartController).toHaveBeenCalledTimes(1);
    expect(addDataChartService).toHaveBeenCalledTimes(1);
    expect(addDataChartService).toHaveBeenCalledWith(payload);
    expect(addChartDataSocketGateway).toHaveBeenCalledTimes(1);
    expect(addChartDataSocketGateway).toHaveBeenCalledWith(payload);
    done();
  });
});

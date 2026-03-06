import SocketController from '../socket.controller';
import SocketService from '../socket.service';
import EventsGateway from '@share/libs/socket/event-socket.gateway';
import startUp from './pre-setup';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';

let socketController: SocketController;
let socketService: SocketService;
let socketGateway: EventsGateway;
const userId: string = Date.now().toString();

beforeAll(async () => {
  const moduleRef = await startUp();
  socketController = moduleRef.get(SocketController);
  socketService = moduleRef.get(SocketService);
  socketGateway = moduleRef.get(EventsGateway);
});

describe('refresh product info', () => {
  it('refresh product info success', () => {
    expect.hasAssertions();
    const refreshCurrentInfoSocketGateway = jest.spyOn(socketGateway, 'refreshCurrentInfo').mockImplementation(jest.fn);
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
    const refreshCurrentInfoSocketGateway = jest.spyOn(socketGateway, 'refreshCurrentInfo').mockImplementation(() => {
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

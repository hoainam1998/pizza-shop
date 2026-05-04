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

describe('update user complete', () => {
  it('emit socket message when update user complete success', () => {
    expect.hasAssertions();
    const updateUserCompleteSocketGateway = jest.spyOn(socketGateway, 'updateUserComplete').mockImplementation(jest.fn);
    const updateUserCompleteService = jest.spyOn(socketService, 'updateUserComplete');
    const updateUserCompleteController = jest.spyOn(socketController, 'updateUserComplete');
    socketController.updateUserComplete(userId);
    expect(updateUserCompleteController).toHaveBeenCalledTimes(1);
    expect(updateUserCompleteService).toHaveBeenCalledTimes(1);
    expect(updateUserCompleteService).toHaveBeenCalledWith(userId);
    expect(updateUserCompleteSocketGateway).toHaveBeenCalledTimes(1);
    expect(updateUserCompleteSocketGateway).toHaveBeenCalledWith(userId);
  });

  it('emit socket message when update user complete was failed with unknown error', () => {
    expect.hasAssertions();
    const updateUserCompleteSocketGateway = jest.spyOn(socketGateway, 'updateUserComplete').mockImplementation(() => {
      throw UnknownError;
    });
    const updateUserCompleteService = jest.spyOn(socketService, 'updateUserComplete');
    const updateUserCompleteController = jest.spyOn(socketController, 'updateUserComplete');
    expect(() => socketController.updateUserComplete(userId)).toThrow(UnknownError);
    expect(updateUserCompleteController).toHaveBeenCalledTimes(1);
    expect(updateUserCompleteService).toHaveBeenCalledTimes(1);
    expect(updateUserCompleteService).toHaveBeenCalledWith(userId);
    expect(updateUserCompleteSocketGateway).toHaveBeenCalledTimes(1);
    expect(updateUserCompleteSocketGateway).toHaveBeenCalledWith(userId);
  });
});

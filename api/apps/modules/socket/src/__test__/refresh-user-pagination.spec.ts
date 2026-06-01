import SocketController from '../socket.controller';
import SocketService from '../socket.service';
import UserNotificationEventsGateway from '@share/libs/socket/event-socket/user-notification';
import startUp from './pre-setup';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';

let socketController: SocketController;
let socketService: SocketService;
let userNotificationEventsGateway: UserNotificationEventsGateway;

beforeAll(async () => {
  const moduleRef = await startUp();
  socketController = moduleRef.get(SocketController);
  socketService = moduleRef.get(SocketService);
  userNotificationEventsGateway = moduleRef.get(UserNotificationEventsGateway);
});

describe('refresh user pagination', () => {
  it('refresh user pagination success', () => {
    expect.hasAssertions();
    const refreshUserPaginationSocketGateway = jest
      .spyOn(userNotificationEventsGateway, 'refreshUserPagination')
      .mockImplementation(jest.fn);
    const refreshUserPaginationService = jest.spyOn(socketService, 'refreshUserPagination');
    const refreshUserPaginationController = jest.spyOn(socketController, 'refreshUserPagination');
    socketController.refreshUserPagination();
    expect(refreshUserPaginationController).toHaveBeenCalledTimes(1);
    expect(refreshUserPaginationService).toHaveBeenCalledTimes(1);
    expect(refreshUserPaginationSocketGateway).toHaveBeenCalledTimes(1);
  });

  it('refresh user pagination failed with unknown error', () => {
    expect.hasAssertions();
    const refreshUserPaginationSocketGateway = jest
      .spyOn(userNotificationEventsGateway, 'refreshUserPagination')
      .mockImplementation(() => {
        throw UnknownError;
      });
    const refreshUserPaginationService = jest.spyOn(socketService, 'refreshUserPagination');
    const refreshUserPaginationController = jest.spyOn(socketController, 'refreshUserPagination');
    expect(() => socketController.refreshUserPagination()).toThrow(UnknownError);
    expect(refreshUserPaginationController).toHaveBeenCalledTimes(1);
    expect(refreshUserPaginationService).toHaveBeenCalledTimes(1);
    expect(refreshUserPaginationSocketGateway).toHaveBeenCalledTimes(1);
  });
});

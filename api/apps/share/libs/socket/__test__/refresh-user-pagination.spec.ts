import startUp from './pre-setup';
import UserNotificationEventsGateway from '@share/libs/socket/event-socket/user-notification';
import SocketInstances from '../socket-instances/socket-instances';
import socketEventNames from '@share/constants/socket-event-names';

let userNotificationEventsGateway: UserNotificationEventsGateway;
let close: () => Promise<void>;

const socket: any = {
  emit: jest.fn(),
};

const sockets = [socket, socket];
const emitParameters = sockets.map(() => [socketEventNames.REFRESH_USER_PAGINATION, {}]);

beforeAll(async () => {
  const moduleRef = await startUp();
  userNotificationEventsGateway = moduleRef.get(UserNotificationEventsGateway);
  close = () => moduleRef.close();
});

afterAll(async () => {
  await close();
});

describe('refresh user pagination', () => {
  it('refresh user pagination success', (done) => {
    expect.hasAssertions();
    const getAllSocketClient = jest.spyOn(SocketInstances.Admin, 'getAllSocketClient').mockReturnValue(sockets);
    const refreshUserPagination = jest.spyOn(userNotificationEventsGateway, 'refreshUserPagination');
    userNotificationEventsGateway.refreshUserPagination();
    expect(refreshUserPagination).toHaveBeenCalledTimes(1);
    expect(getAllSocketClient).toHaveBeenCalledTimes(1);
    expect(socket.emit).toHaveBeenCalledTimes(sockets.length);
    expect(socket.emit.mock.calls).toEqual(emitParameters);
    done();
  });

  it('refresh user pagination failed', (done) => {
    expect.hasAssertions();
    const getAllSocketClient = jest.spyOn(SocketInstances.Admin, 'getAllSocketClient').mockReturnValue([]);
    const refreshUserPagination = jest.spyOn(userNotificationEventsGateway, 'refreshUserPagination');
    userNotificationEventsGateway.refreshUserPagination();
    expect(refreshUserPagination).toHaveBeenCalledTimes(1);
    expect(getAllSocketClient).toHaveBeenCalledTimes(1);
    expect(socket.emit).not.toHaveBeenCalled();
    done();
  });
});

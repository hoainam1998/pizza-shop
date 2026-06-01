import startUp from './pre-setup';
import UserNotificationEventsGateway from '@share/libs/socket/event-socket/user-notification';
import { user } from '@share/test/pre-setup/mock/data/user';
import SocketInstances from '../socket-instances/socket-instances';
import socketEventNames from '@share/constants/socket-event-names';

let userNotificationEventsGateway: UserNotificationEventsGateway;
const userId = user.user_id;
let close: () => Promise<void>;

const socket: any = {
  emit: jest.fn(),
};

beforeAll(async () => {
  const moduleRef = await startUp();
  userNotificationEventsGateway = moduleRef.get(UserNotificationEventsGateway);
  close = () => moduleRef.close();
});

afterAll(async () => {
  await close();
});

describe('update user complete emit', () => {
  it('update user complete emit success', (done) => {
    expect.hasAssertions();
    const getSocketClient = jest.spyOn(SocketInstances.Admin, 'getSocketClient').mockReturnValue(socket);
    const updateUserComplete = jest.spyOn(userNotificationEventsGateway, 'updateUserComplete');
    userNotificationEventsGateway.updateUserComplete(userId);
    expect(updateUserComplete).toHaveBeenCalledTimes(1);
    expect(getSocketClient).toHaveBeenCalledTimes(1);
    expect(getSocketClient).toHaveBeenCalledWith(userId);
    expect(socket.emit).toHaveBeenCalledTimes(1);
    expect(socket.emit).toHaveBeenCalledWith(socketEventNames.UPDATE_USER_INFO, {});
    done();
  });

  it('update user complete emit failed', (done) => {
    expect.hasAssertions();
    const getSocketClient = jest.spyOn(SocketInstances.Admin, 'getSocketClient').mockReturnValue(undefined);
    const updateUserComplete = jest.spyOn(userNotificationEventsGateway, 'updateUserComplete');
    userNotificationEventsGateway.updateUserComplete(userId);
    expect(updateUserComplete).toHaveBeenCalledTimes(1);
    expect(getSocketClient).toHaveBeenCalledTimes(1);
    expect(getSocketClient).toHaveBeenCalledWith(userId);
    expect(socket.emit).not.toHaveBeenCalled();
    done();
  });
});

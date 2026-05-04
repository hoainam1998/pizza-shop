import startUp from './pre-setup';
import EventsGateway from '../event-socket.gateway';
import { user } from '@share/test/pre-setup/mock/data/user';
import SocketInstances from '../socket-instances/socket-instances';
import socketEventNames from '@share/constants/socket-event-names';

let gateway: EventsGateway;
const userId = user.user_id;

const socket: any = {
  emit: jest.fn(),
};

beforeAll(async () => {
  const moduleRef = await startUp();
  gateway = moduleRef.get(EventsGateway);
});

describe('update user complete emit', () => {
  it('update user complete emit success', (done) => {
    expect.hasAssertions();
    const getSocketClient = jest.spyOn(SocketInstances.Admin, 'getSocketClient').mockReturnValue(socket);
    const updateUserComplete = jest.spyOn(gateway, 'updateUserComplete');
    gateway.updateUserComplete(userId);
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
    const updateUserComplete = jest.spyOn(gateway, 'updateUserComplete');
    gateway.updateUserComplete(userId);
    expect(updateUserComplete).toHaveBeenCalledTimes(1);
    expect(getSocketClient).toHaveBeenCalledTimes(1);
    expect(getSocketClient).toHaveBeenCalledWith(userId);
    expect(socket.emit).not.toHaveBeenCalled();
    done();
  });
});

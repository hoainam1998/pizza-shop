import EventsGateway from '../event-socket.gateway';
import startUp from './pre-setup';
import SocketInstances from '../socket-instances/socket-instances';
import socketEventNames from '@share/constants/socket-event-names';
import './socket-instances-storage-mock';

const userId = Date.now().toString();
let gateway: EventsGateway;

const socket: any = {
  emit: jest.fn(),
};

beforeAll(async () => {
  const moduleRef = await startUp();
  gateway = moduleRef.get(EventsGateway);
});

describe('refresh current info', () => {
  it('refresh current info success', () => {
    expect.hasAssertions();
    const getSocketClient = jest.spyOn(SocketInstances.Client, 'getSocketClient').mockReturnValue(socket);
    const refreshCurrentInfo = jest.spyOn(gateway, 'refreshCurrentInfo');
    gateway.refreshCurrentInfo(userId);
    expect(refreshCurrentInfo).toHaveBeenCalledTimes(1);
    expect(refreshCurrentInfo).toHaveBeenCalledWith(userId);
    expect(getSocketClient).toHaveBeenCalledTimes(1);
    expect(getSocketClient).toHaveBeenCalledWith(userId);
    expect(socket.emit).toHaveBeenCalledTimes(1);
    expect(socket.emit).toHaveBeenCalledWith(socketEventNames.REFRESH);
  });

  it('refresh current info failed', () => {
    expect.hasAssertions();
    const getSocketClient = jest.spyOn(SocketInstances.Client, 'getSocketClient').mockReturnValue(undefined);
    const refreshCurrentInfo = jest.spyOn(gateway, 'refreshCurrentInfo');
    gateway.refreshCurrentInfo(userId);
    expect(refreshCurrentInfo).toHaveBeenCalledTimes(1);
    expect(refreshCurrentInfo).toHaveBeenCalledWith(userId);
    expect(getSocketClient).toHaveBeenCalledTimes(1);
    expect(getSocketClient).toHaveBeenCalledWith(userId);
    expect(socket.emit).not.toHaveBeenCalled();
  });
});

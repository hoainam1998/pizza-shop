import startUp from './pre-setup';
import EventsGateway from '../event-socket.gateway';
import { user } from '@share/test/pre-setup/mock/data/user';
import UserCachingService from '@share/libs/caching/user/user.service';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';

let gateway: EventsGateway;
let userCachingService: UserCachingService;

const socket: any = {
  disconnect: jest.fn(),
  requester: {
    userId: user.user_id,
    power: user.power,
    email: user.email,
  },
};

beforeAll(async () => {
  const moduleRef = await startUp();
  gateway = moduleRef.get(EventsGateway);
  userCachingService = moduleRef.get(UserCachingService);
});

describe('logout message', () => {
  it('logout message success', (done) => {
    expect.hasAssertions();
    const logoutPublish = jest.spyOn(userCachingService, 'logoutPublish');
    const logout = jest.spyOn(gateway, 'logout');
    gateway.logout(socket);
    expect(logout).toHaveBeenCalledTimes(1);
    expect(logoutPublish).toHaveBeenCalledTimes(1);
    expect(logoutPublish).toHaveBeenCalledWith(socket.requester.userId);
    expect(socket.disconnect).toHaveBeenCalledTimes(1);
    done();
  });

  it('logout message failed', (done) => {
    expect.hasAssertions();
    const logoutPublish = jest.spyOn(userCachingService, 'logoutPublish').mockImplementation(() => {
      throw UnknownError;
    });
    const logout = jest.spyOn(gateway, 'logout');
    expect(() => gateway.logout(socket)).toThrow(UnknownError);
    expect(logout).toHaveBeenCalledTimes(1);
    expect(logoutPublish).toHaveBeenCalledTimes(1);
    expect(logoutPublish).toHaveBeenCalledWith(socket.requester.userId);
    expect(socket.disconnect).not.toHaveBeenCalled();
    done();
  });
});

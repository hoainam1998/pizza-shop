import { REDIS_CLIENT } from '@share/di-token';
import startUp from './pre-setup';
import RedisClient from '@share/libs/redis-client/redis';
import UserCachingService from '../user.service';
import { autoGeneratePassword, getRedisSessionId } from '@share/utils';
import { user } from '@share/test/pre-setup/mock/data/user';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
const sessionId = autoGeneratePassword();
const sessionIdKey = getRedisSessionId(sessionId);
const sessionString = JSON.stringify({
  user: {
    email: user.email,
    canSignup: false,
    power: user.power,
    userId: user.user_id,
  },
});

let userCachingService: UserCachingService;
let redisClient: RedisClient;

beforeAll(async () => {
  const moduleRef = await startUp();
  userCachingService = moduleRef.get(UserCachingService);
  redisClient = moduleRef.get(REDIS_CLIENT);
});

describe('check user already logged', () => {
  it('check user already logged return data', async () => {
    expect.hasAssertions();
    const get = jest.spyOn(redisClient.Client, 'get').mockResolvedValue(sessionString);
    const checkUserAlreadyLogged = jest.spyOn(userCachingService, 'checkUserAlreadyLogged');
    await expect(userCachingService.checkUserAlreadyLogged(sessionId)).resolves.toBe(sessionString);
    expect(checkUserAlreadyLogged).toHaveBeenCalledTimes(1);
    expect(checkUserAlreadyLogged).toHaveBeenCalledWith(sessionId);
    expect(get).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledWith(sessionIdKey);
  });

  it('check user already logged return null', async () => {
    expect.hasAssertions();
    const get = jest.spyOn(redisClient.Client, 'get').mockResolvedValue(null);
    const checkUserAlreadyLogged = jest.spyOn(userCachingService, 'checkUserAlreadyLogged');
    await expect(userCachingService.checkUserAlreadyLogged(sessionId)).resolves.toBe(null);
    expect(checkUserAlreadyLogged).toHaveBeenCalledTimes(1);
    expect(checkUserAlreadyLogged).toHaveBeenCalledWith(sessionId);
    expect(get).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledWith(sessionIdKey);
  });

  it('check user already logged throw unknown error', async () => {
    expect.hasAssertions();
    const get = jest.spyOn(redisClient.Client, 'get').mockRejectedValue(UnknownError);
    const checkUserAlreadyLogged = jest.spyOn(userCachingService, 'checkUserAlreadyLogged');
    await expect(userCachingService.checkUserAlreadyLogged(sessionId)).rejects.toThrow(UnknownError);
    expect(checkUserAlreadyLogged).toHaveBeenCalledTimes(1);
    expect(checkUserAlreadyLogged).toHaveBeenCalledWith(sessionId);
    expect(get).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledWith(sessionIdKey);
  });
});

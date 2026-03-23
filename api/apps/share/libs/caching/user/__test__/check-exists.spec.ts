import { REDIS_CLIENT } from '@share/di-token';
import startUp from './pre-setup';
import RedisClient from '@share/libs/redis-client/redis';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import UserCachingService from '../user.service';
import { autoGeneratePassword, getRedisSessionId } from '@share/utils';
const sessionId = autoGeneratePassword();
const sessionIdKey = getRedisSessionId(sessionId);

let userCachingService: UserCachingService;
let redisClient: RedisClient;

beforeAll(async () => {
  const moduleRef = await startUp();
  userCachingService = moduleRef.get(UserCachingService);
  redisClient = moduleRef.get(REDIS_CLIENT);
});

describe('check exist', () => {
  it('check exist return true', async () => {
    expect.hasAssertions();
    const redisExists = jest.spyOn(redisClient.Client, 'exists').mockResolvedValue(1);
    const exist = jest.spyOn(userCachingService as any, 'exists');
    await expect(userCachingService.checkExists(sessionId)).resolves.toBe(true);
    expect(exist).toHaveBeenCalledTimes(1);
    expect(exist).toHaveBeenCalledWith(sessionIdKey);
    expect(redisExists).toHaveBeenCalledTimes(1);
    expect(redisExists).toHaveBeenCalledWith(sessionIdKey);
  });

  it('check exist return false', async () => {
    expect.hasAssertions();
    const redisExists = jest.spyOn(redisClient.Client, 'exists').mockResolvedValue(0);
    const exist = jest.spyOn(userCachingService as any, 'exists');
    await expect(userCachingService.checkExists(sessionId)).resolves.toBe(false);
    expect(exist).toHaveBeenCalledTimes(1);
    expect(exist).toHaveBeenCalledWith(sessionIdKey);
    expect(redisExists).toHaveBeenCalledTimes(1);
    expect(redisExists).toHaveBeenCalledWith(sessionIdKey);
  });

  it('check exist failed with unknown error', async () => {
    expect.hasAssertions();
    const redisExists = jest.spyOn(redisClient.Client, 'exists').mockRejectedValue(UnknownError);
    const exist = jest.spyOn(userCachingService as any, 'exists');
    await expect(userCachingService.checkExists(sessionId)).rejects.toThrow(UnknownError);
    expect(exist).toHaveBeenCalledTimes(1);
    expect(exist).toHaveBeenCalledWith(sessionIdKey);
    expect(redisExists).toHaveBeenCalledTimes(1);
    expect(redisExists).toHaveBeenCalledWith(sessionIdKey);
  });
});

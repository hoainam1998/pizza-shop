import { REDIS_CLIENT } from '@share/di-token';
import startUp from './pre-setup';
import RedisClient from '@share/libs/redis-client/redis';
import UserCachingService from '../user.service';
import constants from '@share/constants';
import { user, apiKey } from '@share/test/pre-setup/mock/data/user';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
const REDIS_PREFIX_USER = constants.REDIS_PREFIX.USER;

let userCachingService: UserCachingService;
let redisClient: RedisClient;
const userId = user.user_id;

beforeAll(async () => {
  const moduleRef = await startUp();
  userCachingService = moduleRef.get(UserCachingService);
  redisClient = moduleRef.get(REDIS_CLIENT);
});

describe('check user api key', () => {
  it('check user api key was success', async () => {
    expect.hasAssertions();
    const hGet = jest.spyOn(redisClient.Client, 'hGet').mockResolvedValue(apiKey);
    const getUserApiKey = jest.spyOn(userCachingService, 'getUserApiKey');
    await expect(userCachingService.getUserApiKey(userId)).resolves.toBe(apiKey);
    expect(getUserApiKey).toHaveBeenCalledTimes(1);
    expect(hGet).toHaveBeenCalledTimes(1);
    expect(hGet).toHaveBeenCalledWith(REDIS_PREFIX_USER, userId);
  });

  it('check user api key return null', async () => {
    expect.hasAssertions();
    const hGet = jest.spyOn(redisClient.Client, 'hGet').mockResolvedValue(null);
    const getUserApiKey = jest.spyOn(userCachingService, 'getUserApiKey');
    await expect(userCachingService.getUserApiKey(userId)).resolves.toBe(null);
    expect(getUserApiKey).toHaveBeenCalledTimes(1);
    expect(hGet).toHaveBeenCalledTimes(1);
    expect(hGet).toHaveBeenCalledWith(REDIS_PREFIX_USER, userId);
  });

  it('check user api key failed with unknown error', async () => {
    expect.hasAssertions();
    const hGet = jest.spyOn(redisClient.Client, 'hGet').mockRejectedValue(UnknownError);
    const getUserApiKey = jest.spyOn(userCachingService, 'getUserApiKey');
    await expect(userCachingService.getUserApiKey(userId)).rejects.toThrow(UnknownError);
    expect(getUserApiKey).toHaveBeenCalledTimes(1);
    expect(hGet).toHaveBeenCalledTimes(1);
    expect(hGet).toHaveBeenCalledWith(REDIS_PREFIX_USER, userId);
  });
});

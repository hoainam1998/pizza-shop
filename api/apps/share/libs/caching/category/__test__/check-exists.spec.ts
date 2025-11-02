import { REDIS_CLIENT } from '@share/di-token';
import startUp from './pre-setup';
import RedisClient from '@share/libs/redis-client/redis';
import constants from '@share/constants';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import CategoryCachingService from '../category.service';
const categoryKey = constants.REDIS_PREFIX.CATEGORIES;

let categoryCachingService: CategoryCachingService;
let redisClient: RedisClient;

beforeEach(async () => {
  const moduleRef = await startUp();
  categoryCachingService = moduleRef.get(CategoryCachingService);
  redisClient = moduleRef.get(REDIS_CLIENT);
});

describe('check exist', () => {
  it('check exist return true', async () => {
    expect.hasAssertions();
    const redisExists = jest.spyOn(redisClient.Client, 'exists').mockResolvedValue(1);
    const exists = jest.spyOn(categoryCachingService as any, 'exists');
    await expect(categoryCachingService.checkExists()).resolves.toBe(true);
    expect(exists).toHaveBeenCalledTimes(1);
    expect(exists).toHaveBeenCalledWith(categoryKey);
    expect(redisExists).toHaveBeenCalledTimes(1);
    expect(redisExists).toHaveBeenCalledWith(categoryKey);
  });

  it('check exist return false', async () => {
    expect.hasAssertions();
    const redisExists = jest.spyOn(redisClient.Client, 'exists').mockResolvedValue(0);
    const exists = jest.spyOn(categoryCachingService as any, 'exists');
    await expect(categoryCachingService.checkExists()).resolves.toBe(false);
    expect(exists).toHaveBeenCalledTimes(1);
    expect(exists).toHaveBeenCalledWith(categoryKey);
    expect(redisExists).toHaveBeenCalledTimes(1);
    expect(redisExists).toHaveBeenCalledWith(categoryKey);
  });

  it('check exist failed with unknown error', async () => {
    expect.hasAssertions();
    const redisExists = jest.spyOn(redisClient.Client, 'exists').mockRejectedValue(UnknownError);
    const exists = jest.spyOn(categoryCachingService as any, 'exists');
    await expect(categoryCachingService.checkExists()).rejects.toThrow(UnknownError);
    expect(exists).toHaveBeenCalledTimes(1);
    expect(exists).toHaveBeenCalledWith(categoryKey);
    expect(redisExists).toHaveBeenCalledTimes(1);
    expect(redisExists).toHaveBeenCalledWith(categoryKey);
  });
});

import CategoryCachingService from '../category.service';
import { REDIS_CLIENT } from '@share/di-token';
import startUp from './pre-setup';
import RedisClient from '@share/libs/redis-client/redis';
import constants from '@share/constants';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
const categoryKey = constants.REDIS_PREFIX.CATEGORIES;

let categoryCachingService: CategoryCachingService;
let redisClient: RedisClient;

beforeEach(async () => {
  const moduleRef = await startUp();
  categoryCachingService = moduleRef.get(CategoryCachingService);
  redisClient = moduleRef.get(REDIS_CLIENT);
});

describe('delete all caching categories', () => {
  it('delete all caching categories success', async () => {
    expect.hasAssertions();
    const del = jest.spyOn(redisClient.Client, 'del').mockResolvedValue(1);
    await expect(categoryCachingService.deleteAllCategories()).resolves.toBe(1);
    expect(del).toHaveBeenCalledTimes(1);
    expect(del).toHaveBeenCalledWith(categoryKey);
  });

  it('delete all caching categories failed with unknown error', async () => {
    expect.hasAssertions();
    const del = jest.spyOn(redisClient.Client, 'del').mockRejectedValue(UnknownError);
    await expect(categoryCachingService.deleteAllCategories()).rejects.toThrow(UnknownError);
    expect(del).toHaveBeenCalledTimes(1);
    expect(del).toHaveBeenCalledWith(categoryKey);
  });
});

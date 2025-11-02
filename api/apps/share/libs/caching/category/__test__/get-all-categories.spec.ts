import CategoryCachingService from '../category.service';
import { REDIS_CLIENT } from '@share/di-token';
import startUp from './pre-setup';
import RedisClient from '@share/libs/redis-client/redis';
import constants from '@share/constants';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import { createCategoryList } from '@share/test/pre-setup/mock/data/category';
const categoryKey = constants.REDIS_PREFIX.CATEGORIES;

let categoryCachingService: CategoryCachingService;
let redisClient: RedisClient;
const categories = createCategoryList(2);

beforeEach(async () => {
  const moduleRef = await startUp();
  categoryCachingService = moduleRef.get(CategoryCachingService);
  redisClient = moduleRef.get(REDIS_CLIENT);
});

describe('get all caching categories', () => {
  it('get all caching categories success', async () => {
    expect.hasAssertions();
    const get = jest.spyOn(redisClient.Client.json, 'get').mockResolvedValue([categories]);
    const jsonGet = jest.spyOn(categoryCachingService as any, 'jsonGet');
    await expect(categoryCachingService.getAllCategories()).resolves.toBe(categories);
    expect(jsonGet).toHaveBeenCalledTimes(1);
    expect(jsonGet).toHaveBeenCalledWith(categoryKey);
    expect(get).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledWith(categoryKey, { path: '$' });
  });

  it('get all caching categories with unknown error', async () => {
    expect.hasAssertions();
    const get = jest.spyOn(redisClient.Client.json, 'get').mockRejectedValue(UnknownError);
    const jsonGet = jest.spyOn(categoryCachingService as any, 'jsonGet');
    await expect(categoryCachingService.getAllCategories()).rejects.toThrow(UnknownError);
    expect(jsonGet).toHaveBeenCalledTimes(1);
    expect(jsonGet).toHaveBeenCalledWith(categoryKey);
    expect(get).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledWith(categoryKey, { path: '$' });
  });
});

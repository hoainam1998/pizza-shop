import { REDIS_CLIENT } from '@share/di-token';
import startUp from './pre-setup';
import RedisClient from '@share/libs/redis-client/redis';
import constants from '@share/constants';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import CategoryCachingService from '../category.service';
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

describe('store all categories', () => {
  it('store all categories success', async () => {
    expect.hasAssertions();
    const result = 'OK';
    const redisJsonSet = jest.spyOn(redisClient.Client.json, 'set').mockResolvedValue(result);
    const jsonGet = jest.spyOn(categoryCachingService as any, 'jsonSet');
    await expect(categoryCachingService.storeAllCategories(categories)).resolves.toBe(result);
    expect(jsonGet).toHaveBeenCalledTimes(1);
    expect(jsonGet).toHaveBeenCalledWith(categoryKey, categories);
    expect(redisJsonSet).toHaveBeenCalledTimes(1);
    expect(redisJsonSet).toHaveBeenCalledWith(categoryKey, '$', categories);
  });

  it('store all categories return null', async () => {
    expect.hasAssertions();
    const redisJsonSet = jest.spyOn(redisClient.Client.json, 'set').mockResolvedValue(null);
    const jsonGet = jest.spyOn(categoryCachingService as any, 'jsonSet');
    await expect(categoryCachingService.storeAllCategories(categories)).resolves.toBe(null);
    expect(jsonGet).toHaveBeenCalledTimes(1);
    expect(jsonGet).toHaveBeenCalledWith(categoryKey, categories);
    expect(redisJsonSet).toHaveBeenCalledTimes(1);
    expect(redisJsonSet).toHaveBeenCalledWith(categoryKey, '$', categories);
  });

  it('store all categories failed', async () => {
    expect.hasAssertions();
    const redisJsonSet = jest.spyOn(redisClient.Client.json, 'set').mockRejectedValue(UnknownError);
    const jsonGet = jest.spyOn(categoryCachingService as any, 'jsonSet');
    await expect(categoryCachingService.storeAllCategories(categories)).rejects.toThrow(UnknownError);
    expect(jsonGet).toHaveBeenCalledTimes(1);
    expect(jsonGet).toHaveBeenCalledWith(categoryKey, categories);
    expect(redisJsonSet).toHaveBeenCalledTimes(1);
    expect(redisJsonSet).toHaveBeenCalledWith(categoryKey, '$', categories);
  });
});

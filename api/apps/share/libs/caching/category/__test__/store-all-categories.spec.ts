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

afterEach((done) => {
  jest.restoreAllMocks();
  jest.resetAllMocks();
  done();
});

describe('store all categories', () => {
  it('store all categories success', async () => {
    const result = 'OK';
    const jsonSet = jest.spyOn(redisClient.Client.json, 'set').mockResolvedValue(result);
    await expect(categoryCachingService.storeAllCategories(categories)).resolves.toBe(result);
    expect(jsonSet).toHaveBeenCalledTimes(1);
    expect(jsonSet).toHaveBeenCalledWith(categoryKey, '$', categories);
  });

  it('store all categories return null', async () => {
    const jsonSet = jest.spyOn(redisClient.Client.json, 'set').mockResolvedValue(null);
    await expect(categoryCachingService.storeAllCategories(categories)).resolves.toBe(null);
    expect(jsonSet).toHaveBeenCalledTimes(1);
    expect(jsonSet).toHaveBeenCalledWith(categoryKey, '$', categories);
  });

  it('store all categories failed', async () => {
    const jsonSet = jest.spyOn(redisClient.Client.json, 'set').mockRejectedValue(UnknownError);
    await expect(categoryCachingService.storeAllCategories(categories)).rejects.toThrow(UnknownError);
    expect(jsonSet).toHaveBeenCalledTimes(1);
    expect(jsonSet).toHaveBeenCalledWith(categoryKey, '$', categories);
  });
});

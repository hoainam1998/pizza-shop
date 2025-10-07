import { Test } from '@nestjs/testing';
import CategoryCachingService from '@share/libs/caching/category/category.service';
import ShareTestingModule from '@share/test/module';
import ShareModule from '@share/module';
import { REDIS_CLIENT } from '@share/di-token';
import RedisClient from '@share/libs/redis-client/redis';
import { createCategoryList } from '@share/test/pre-setup/mock/data/category';
import constants from '@share/constants';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';

let categoryRedisCaching: CategoryCachingService;
let redisClientService: RedisClient;

beforeEach(async () => {
  const moduleRef = await Test.createTestingModule({
    imports: [ShareModule],
  })
    .overrideModule(ShareModule)
    .useModule(ShareTestingModule)
    .compile();

  categoryRedisCaching = moduleRef.get(CategoryCachingService);
  redisClientService = moduleRef.get(REDIS_CLIENT);
});

afterEach((done) => {
  jest.restoreAllMocks();
  jest.resetAllMocks();
  done();
});

describe('store categories', () => {
  it('store categories were success', async () => {
    const categoryList = createCategoryList(2);
    const storeAllCategoriesMethod = jest.spyOn(categoryRedisCaching, 'storeAllCategories');
    const redisJsonSetMethod = jest.spyOn(redisClientService.Client.json, 'set').mockResolvedValue('OK');
    await expect(categoryRedisCaching.storeAllCategories(categoryList)).resolves.toBe('OK');
    expect(storeAllCategoriesMethod).toHaveBeenCalledTimes(1);
    expect(storeAllCategoriesMethod).toHaveBeenCalledWith(categoryList);
    expect(redisJsonSetMethod).toHaveBeenCalledTimes(1);
    expect(redisJsonSetMethod).toHaveBeenCalledWith(constants.REDIS_PREFIX.CATEGORIES, '$', categoryList);
  });

  it('store categories failed with error', async () => {
    const categoryList = createCategoryList(2);
    const storeAllCategoriesMethod = jest.spyOn(categoryRedisCaching, 'storeAllCategories');
    const redisJsonSetMethod = jest.spyOn(redisClientService.Client.json, 'set').mockRejectedValue(UnknownError);
    await expect(categoryRedisCaching.storeAllCategories(categoryList)).rejects.toThrow(UnknownError);
    expect(storeAllCategoriesMethod).toHaveBeenCalledTimes(1);
    expect(storeAllCategoriesMethod).toHaveBeenCalledWith(categoryList);
    expect(redisJsonSetMethod).toHaveBeenCalledTimes(1);
    expect(redisJsonSetMethod).toHaveBeenCalledWith(constants.REDIS_PREFIX.CATEGORIES, '$', categoryList);
  });
});

describe('check exist', () => {
  it('check exist was success', async () => {
    const checkExistMethod = jest.spyOn(categoryRedisCaching, 'checkExist');
    const redisExistsMethod = jest.spyOn(redisClientService.Client, 'exists').mockResolvedValue(1);
    await expect(categoryRedisCaching.checkExist()).resolves.toBe(true);
    expect(checkExistMethod).toHaveBeenCalledTimes(1);
    expect(redisExistsMethod).toHaveBeenCalledTimes(1);
    expect(redisExistsMethod).toHaveBeenCalledWith(constants.REDIS_PREFIX.CATEGORIES);
  });

  it('check exist failed with error', async () => {
    const checkExistMethod = jest.spyOn(categoryRedisCaching, 'checkExist');
    const redisExistsMethod = jest.spyOn(redisClientService.Client, 'exists').mockRejectedValue(UnknownError);
    await expect(categoryRedisCaching.checkExist()).rejects.toThrow(UnknownError);
    expect(checkExistMethod).toHaveBeenCalledTimes(1);
    expect(redisExistsMethod).toHaveBeenCalledTimes(1);
    expect(redisExistsMethod).toHaveBeenCalledWith(constants.REDIS_PREFIX.CATEGORIES);
  });
});

describe('get all categories', () => {
  it('get all categories was success', async () => {
    const categoryList = createCategoryList(2);
    const getAllCategoriesMethod = jest.spyOn(categoryRedisCaching, 'getAllCategories');
    const redisJsonGetMethod = jest.spyOn(redisClientService.Client.json, 'get').mockResolvedValue([categoryList]);
    await expect(categoryRedisCaching.getAllCategories()).resolves.toBe(categoryList);
    expect(getAllCategoriesMethod).toHaveBeenCalledTimes(1);
    expect(redisJsonGetMethod).toHaveBeenCalledTimes(1);
    expect(redisJsonGetMethod).toHaveBeenCalledWith(constants.REDIS_PREFIX.CATEGORIES, { path: '$' });
  });

  it('get all categories was success when empty data', async () => {
    const getAllCategoriesMethod = jest.spyOn(categoryRedisCaching, 'getAllCategories');
    const redisJsonGetMethod = jest.spyOn(redisClientService.Client.json, 'get').mockResolvedValue([null]);
    await expect(categoryRedisCaching.getAllCategories()).resolves.toBe(null);
    expect(getAllCategoriesMethod).toHaveBeenCalledTimes(1);
    expect(redisJsonGetMethod).toHaveBeenCalledTimes(1);
    expect(redisJsonGetMethod).toHaveBeenCalledWith(constants.REDIS_PREFIX.CATEGORIES, { path: '$' });
  });

  it('get all categories was success when empty data', async () => {
    const getAllCategoriesMethod = jest.spyOn(categoryRedisCaching, 'getAllCategories');
    const redisJsonGetMethod = jest.spyOn(redisClientService.Client.json, 'get').mockRejectedValue(UnknownError);
    await expect(categoryRedisCaching.getAllCategories()).rejects.toThrow(UnknownError);
    expect(getAllCategoriesMethod).toHaveBeenCalledTimes(1);
    expect(redisJsonGetMethod).toHaveBeenCalledTimes(1);
    expect(redisJsonGetMethod).toHaveBeenCalledWith(constants.REDIS_PREFIX.CATEGORIES, { path: '$' });
  });
});

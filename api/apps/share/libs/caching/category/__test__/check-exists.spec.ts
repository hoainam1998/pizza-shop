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

afterEach((done) => {
  jest.restoreAllMocks();
  jest.resetAllMocks();
  done();
});

describe('check exist', () => {
  it('check exist return true', async () => {
    const exists = jest.spyOn(redisClient.Client, 'exists').mockResolvedValue(1);
    await expect(categoryCachingService.checkExist()).resolves.toBe(true);
    expect(exists).toHaveBeenCalledTimes(1);
    expect(exists).toHaveBeenCalledWith(categoryKey);
  });

  it('check exist return false', async () => {
    const exists = jest.spyOn(redisClient.Client, 'exists').mockResolvedValue(0);
    await expect(categoryCachingService.checkExist()).resolves.toBe(false);
    expect(exists).toHaveBeenCalledTimes(1);
    expect(exists).toHaveBeenCalledWith(categoryKey);
  });

  it('check exist failed with unknown error', async () => {
    const exists = jest.spyOn(redisClient.Client, 'exists').mockRejectedValue(UnknownError);
    await expect(categoryCachingService.checkExist()).rejects.toThrow(UnknownError);
    expect(exists).toHaveBeenCalledTimes(1);
    expect(exists).toHaveBeenCalledWith(categoryKey);
  });
});

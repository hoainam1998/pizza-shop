import { REDIS_CLIENT } from '@share/di-token';
import startUp from './pre-setup';
import RedisClient from '@share/libs/redis-client/redis';
import constants from '@share/constants';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import IngredientCachingService from '../ingredient.service';
const ingredientKey = constants.REDIS_PREFIX.INGREDIENTS;

let ingredientCachingService: IngredientCachingService;
let redisClient: RedisClient;

beforeEach(async () => {
  const moduleRef = await startUp();
  ingredientCachingService = moduleRef.get(IngredientCachingService);
  redisClient = moduleRef.get(REDIS_CLIENT);
});

describe('check exist', () => {
  it('check exist return true', async () => {
    expect.hasAssertions();
    const redisExists = jest.spyOn(redisClient.Client, 'exists').mockResolvedValue(1);
    const exist = jest.spyOn(ingredientCachingService as any, 'exists');
    await expect(ingredientCachingService.checkExists()).resolves.toBe(true);
    expect(exist).toHaveBeenCalledTimes(1);
    expect(exist).toHaveBeenCalledWith(ingredientKey);
    expect(redisExists).toHaveBeenCalledTimes(1);
    expect(redisExists).toHaveBeenCalledWith(ingredientKey);
  });

  it('check exist return false', async () => {
    expect.hasAssertions();
    const redisExists = jest.spyOn(redisClient.Client, 'exists').mockResolvedValue(0);
    const exist = jest.spyOn(ingredientCachingService as any, 'exists');
    await expect(ingredientCachingService.checkExists()).resolves.toBe(false);
    expect(exist).toHaveBeenCalledTimes(1);
    expect(exist).toHaveBeenCalledWith(ingredientKey);
    expect(redisExists).toHaveBeenCalledTimes(1);
    expect(redisExists).toHaveBeenCalledWith(ingredientKey);
  });

  it('check exist failed with unknown error', async () => {
    expect.hasAssertions();
    const redisExists = jest.spyOn(redisClient.Client, 'exists').mockRejectedValue(UnknownError);
    const exist = jest.spyOn(ingredientCachingService as any, 'exists');
    await expect(ingredientCachingService.checkExists()).rejects.toThrow(UnknownError);
    expect(exist).toHaveBeenCalledTimes(1);
    expect(exist).toHaveBeenCalledWith(ingredientKey);
    expect(redisExists).toHaveBeenCalledTimes(1);
    expect(redisExists).toHaveBeenCalledWith(ingredientKey);
  });
});

import IngredientCachingService from '../ingredient.service';
import { REDIS_CLIENT } from '@share/di-token';
import startUp from './pre-setup';
import RedisClient from '@share/libs/redis-client/redis';
import constants from '@share/constants';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
const ingredientKey = constants.REDIS_PREFIX.INGREDIENTS;

let ingredientCachingService: IngredientCachingService;
let redisClient: RedisClient;

beforeEach(async () => {
  const moduleRef = await startUp();
  ingredientCachingService = moduleRef.get(IngredientCachingService);
  redisClient = moduleRef.get(REDIS_CLIENT);
});

describe('delete all caching ingredient', () => {
  it('delete all caching ingredient success', async () => {
    expect.hasAssertions();
    const del = jest.spyOn(redisClient.Client, 'del').mockResolvedValue(1);
    await expect(ingredientCachingService.deleteAllIngredients()).resolves.toBe(1);
    expect(del).toHaveBeenCalledTimes(1);
    expect(del).toHaveBeenCalledWith(ingredientKey);
  });

  it('delete all caching ingredient failed with unknown error', async () => {
    expect.hasAssertions();
    const del = jest.spyOn(redisClient.Client, 'del').mockRejectedValue(UnknownError);
    await expect(ingredientCachingService.deleteAllIngredients()).rejects.toThrow(UnknownError);
    expect(del).toHaveBeenCalledTimes(1);
    expect(del).toHaveBeenCalledWith(ingredientKey);
  });
});

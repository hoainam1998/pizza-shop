import IngredientCachingService from '../ingredient.service';
import { REDIS_CLIENT } from '@share/di-token';
import startUp from './pre-setup';
import RedisClient from '@share/libs/redis-client/redis';
import constants from '@share/constants';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import { createIngredients } from '@share/test/pre-setup/mock/data/ingredient';
const ingredients = createIngredients(2);
const ingredientKey = constants.REDIS_PREFIX.INGREDIENTS;

let ingredientCachingService: IngredientCachingService;
let redisClient: RedisClient;

beforeEach(async () => {
  const moduleRef = await startUp();
  ingredientCachingService = moduleRef.get(IngredientCachingService);
  redisClient = moduleRef.get(REDIS_CLIENT);
});

describe('get all ingredients', () => {
  it('get all ingredients success', async () => {
    const jsonGet = jest.spyOn(redisClient.Client.json, 'get').mockResolvedValue([ingredients]);
    await expect(ingredientCachingService.getAllIngredients()).resolves.toBe(ingredients);
    expect(jsonGet).toHaveBeenCalledTimes(1);
    expect(jsonGet).toHaveBeenCalledWith(ingredientKey, { path: '$' });
  });

  it('get all ingredients failed with unknown error', async () => {
    const jsonGet = jest.spyOn(redisClient.Client.json, 'get').mockRejectedValue(UnknownError);
    await expect(ingredientCachingService.getAllIngredients()).rejects.toThrow(UnknownError);
    expect(jsonGet).toHaveBeenCalledTimes(1);
    expect(jsonGet).toHaveBeenCalledWith(ingredientKey, { path: '$' });
  });
});

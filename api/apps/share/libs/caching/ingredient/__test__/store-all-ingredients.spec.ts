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

describe('store all ingredients', () => {
  it('store all ingredients success', async () => {
    expect.hasAssertions();
    const result = 'OK';
    const jsonSet = jest.spyOn(redisClient.Client.json, 'set').mockResolvedValue(result);
    await expect(ingredientCachingService.storeAllIngredients(ingredients)).resolves.toBe(result);
    expect(jsonSet).toHaveBeenCalledTimes(1);
    expect(jsonSet).toHaveBeenCalledWith(ingredientKey, '$', ingredients);
  });

  it('store all ingredients failed with unknown error', async () => {
    expect.hasAssertions();
    const jsonSet = jest.spyOn(redisClient.Client.json, 'set').mockRejectedValue(UnknownError);
    await expect(ingredientCachingService.storeAllIngredients(ingredients)).rejects.toThrow(UnknownError);
    expect(jsonSet).toHaveBeenCalledTimes(1);
    expect(jsonSet).toHaveBeenCalledWith(ingredientKey, '$', ingredients);
  });
});

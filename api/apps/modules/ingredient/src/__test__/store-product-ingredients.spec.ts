import IngredientCachingService, { ingredientName } from '@share/libs/caching/ingredient/ingredient.service';
import { createRedisProductIngredients } from '@share/test/pre-setup/mock/data/ingredient';
import startUp from './pre-setup';
import RedisClient from '@share/libs/redis-client/redis';
import { REDIS_CLIENT } from '@share/di-token';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';

const length = 2;
const productId = Date.now().toString();
const ingredients = createRedisProductIngredients(length);
let ingredientCachingService: IngredientCachingService;
let redisClientService: RedisClient;

beforeEach(async () => {
  const moduleRef = await startUp();
  ingredientCachingService = moduleRef.get(IngredientCachingService);
  redisClientService = moduleRef.get(REDIS_CLIENT);
});

describe('store product ingredients', () => {
  it('store product ingredients success', async () => {
    expect.hasAssertions();
    // result === 1, similar del process have success
    const hSetResult = 1;
    const hSet = jest.spyOn(redisClientService.Client, 'hSet').mockResolvedValue(hSetResult);
    await expect(ingredientCachingService.storeProductIngredients(productId, ingredients)).resolves.toBe(hSetResult);
    expect(hSet).toHaveBeenCalledTimes(1);
    expect(hSet).toHaveBeenCalledWith(ingredientName(productId), ingredients);
  });

  it('store product ingredients failed with unknown error', async () => {
    expect.hasAssertions();
    const hSet = jest.spyOn(redisClientService.Client, 'hSet').mockRejectedValue(UnknownError);
    await expect(ingredientCachingService.storeProductIngredients(productId, ingredients)).rejects.toThrow(
      UnknownError,
    );
    expect(hSet).toHaveBeenCalledTimes(1);
    expect(hSet).toHaveBeenCalledWith(ingredientName(productId), ingredients);
  });
});

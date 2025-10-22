import IngredientCachingService, { ingredientName } from '@share/libs/caching/ingredient/ingredient.service';
import startUp from './pre-setup';
import RedisClient from '@share/libs/redis-client/redis';
import { REDIS_CLIENT } from '@share/di-token';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';

const productId = Date.now().toString();
let ingredientCachingService: IngredientCachingService;
let redisClientService: RedisClient;

beforeEach(async () => {
  const moduleRef = await startUp();
  ingredientCachingService = moduleRef.get(IngredientCachingService);
  redisClientService = moduleRef.get(REDIS_CLIENT);
});

describe('delete all product ingredient', () => {
  it('delete all product ingredient success', async () => {
    expect.hasAssertions();
    // result === 1, similar del process have success
    const delResult = 1;
    const del = jest.spyOn(redisClientService.Client, 'del').mockResolvedValue(delResult);
    await expect(ingredientCachingService.deleteAllProductIngredients(productId)).resolves.toBe(1);
    expect(del).toHaveBeenCalledTimes(1);
    expect(del).toHaveBeenCalledWith(ingredientName(productId));
  });

  it('delete all product ingredient failed with unknown error', async () => {
    expect.hasAssertions();
    const del = jest.spyOn(redisClientService.Client, 'del').mockRejectedValue(UnknownError);
    await expect(ingredientCachingService.deleteAllProductIngredients(productId)).rejects.toThrow(UnknownError);
    expect(del).toHaveBeenCalledTimes(1);
    expect(del).toHaveBeenCalledWith(ingredientName(productId));
  });
});

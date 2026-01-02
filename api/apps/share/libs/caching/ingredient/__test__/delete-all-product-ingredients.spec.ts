import IngredientCachingService from '../ingredient.service';
import { REDIS_CLIENT } from '@share/di-token';
import startUp from './pre-setup';
import RedisClient from '@share/libs/redis-client/redis';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import { product } from '@share/test/pre-setup/mock/data/product';
import { ingredientName } from '../ingredient.service';
const productId: string = product.productId;

let ingredientCachingService: IngredientCachingService;
let redisClient: RedisClient;

beforeEach(async () => {
  const moduleRef = await startUp();
  ingredientCachingService = moduleRef.get(IngredientCachingService);
  redisClient = moduleRef.get(REDIS_CLIENT);
});

describe('delete all product ingredients', () => {
  it('delete all product ingredients success', async () => {
    expect.hasAssertions();
    const del = jest.spyOn(redisClient.Client, 'del').mockResolvedValue(1);
    await expect(ingredientCachingService.deleteAllProductIngredients(productId)).resolves.toBe(1);
    expect(del).toHaveBeenCalledTimes(1);
    expect(del).toHaveBeenCalledWith(ingredientName(productId));
  });

  it('delete all product ingredients failed with unknown error', async () => {
    expect.hasAssertions();
    const del = jest.spyOn(redisClient.Client, 'del').mockRejectedValue(UnknownError);
    await expect(ingredientCachingService.deleteAllProductIngredients(productId)).rejects.toThrow(UnknownError);
    expect(del).toHaveBeenCalledTimes(1);
    expect(del).toHaveBeenCalledWith(ingredientName(productId));
  });
});

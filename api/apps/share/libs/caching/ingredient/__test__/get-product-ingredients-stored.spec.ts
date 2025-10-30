import IngredientCachingService from '../ingredient.service';
import { REDIS_CLIENT } from '@share/di-token';
import startUp from './pre-setup';
import RedisClient from '@share/libs/redis-client/redis';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import { product } from '@share/test/pre-setup/mock/data/product';
import { ingredientName } from '../ingredient.service';
import { createIngredients, createIngredientsJson } from '@share/test/pre-setup/mock/data/ingredient';
const productId = product.productId;
const ingredientJson = createIngredientsJson(2);
const ingredientIds = createIngredients(2).map((ingredient) => ingredient.ingredient_id);

let ingredientCachingService: IngredientCachingService;
let redisClient: RedisClient;

beforeEach(async () => {
  const moduleRef = await startUp();
  ingredientCachingService = moduleRef.get(IngredientCachingService);
  redisClient = moduleRef.get(REDIS_CLIENT);
});

describe('get product ingredient stored', () => {
  it('get product ingredient stored success', async () => {
    const hmGet = jest.spyOn(redisClient.Client, 'hmGet').mockResolvedValue(ingredientJson);
    await expect(ingredientCachingService.getProductIngredientsStored(productId, ingredientIds)).resolves.toBe(
      ingredientJson,
    );
    expect(hmGet).toHaveBeenCalledTimes(1);
    expect(hmGet).toHaveBeenCalledWith(ingredientName(productId), ingredientIds);
  });

  it('get product ingredient stored failed with unknown error', async () => {
    const hmGet = jest.spyOn(redisClient.Client, 'hmGet').mockRejectedValue(UnknownError);
    await expect(ingredientCachingService.getProductIngredientsStored(productId, ingredientIds)).rejects.toThrow(
      UnknownError,
    );
    expect(hmGet).toHaveBeenCalledTimes(1);
    expect(hmGet).toHaveBeenCalledWith(ingredientName(productId), ingredientIds);
  });
});

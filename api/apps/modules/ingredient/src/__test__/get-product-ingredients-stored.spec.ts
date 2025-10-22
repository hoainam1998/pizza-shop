import IngredientCachingService, { ingredientName } from '@share/libs/caching/ingredient/ingredient.service';
import { createIngredients } from '@share/test/pre-setup/mock/data/ingredient';
import startUp from './pre-setup';
import RedisClient from '@share/libs/redis-client/redis';
import { REDIS_CLIENT } from '@share/di-token';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';

const length = 2;
const productId = Date.now().toString();
let ingredientCachingService: IngredientCachingService;
let redisClientService: RedisClient;
const ingredientIds = createIngredients(length).map((ingredient) => ingredient.ingredient_id);

beforeEach(async () => {
  const moduleRef = await startUp();
  ingredientCachingService = moduleRef.get(IngredientCachingService);
  redisClientService = moduleRef.get(REDIS_CLIENT);
});

describe('get product ingredients stored', () => {
  it('get product ingredients stored success', async () => {
    expect.hasAssertions();
    const hmGetResult = ['Ok'];
    const hmGet = jest.spyOn(redisClientService.Client, 'hmGet').mockResolvedValue(hmGetResult);
    await expect(ingredientCachingService.getProductIngredientsStored(productId, ingredientIds)).resolves.toEqual(
      hmGetResult,
    );
    expect(hmGet).toHaveBeenCalledTimes(1);
    expect(hmGet).toHaveBeenCalledWith(ingredientName(productId), ingredientIds);
  });

  it('get product ingredients stored failed with unknown error', async () => {
    expect.hasAssertions();
    const hmGet = jest.spyOn(redisClientService.Client, 'hmGet').mockRejectedValue(UnknownError);
    await expect(ingredientCachingService.getProductIngredientsStored(productId, ingredientIds)).rejects.toThrow(
      UnknownError,
    );
    expect(hmGet).toHaveBeenCalledTimes(1);
    expect(hmGet).toHaveBeenCalledWith(ingredientName(productId), ingredientIds);
  });
});

import { PrismaClient } from 'generated/prisma';
import IngredientService from '../ingredient.service';
import IngredientCachingService from '@share/libs/caching/ingredient/ingredient.service';
import { PrismaDisconnectError } from '@share/test/pre-setup/mock/errors/prisma-errors';
import { PRISMA_CLIENT } from '@share/di-token';
import startUp from './pre-setup';
import { createIngredients } from '@share/test/pre-setup/mock/data/ingredient';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';

let ingredientService: IngredientService;
let prismaService: PrismaClient;
let ingredientCachingService: IngredientCachingService;
const ingredients = createIngredients(2);

const select = {
  ingredient_id: true,
  name: true,
  avatar: true,
  unit: true,
  count: true,
  expired_time: true,
  status: true,
  price: true,
  _count: {
    select: {
      product_ingredient: true,
    },
  },
};

beforeEach(async () => {
  const moduleRef = await startUp();

  ingredientService = moduleRef.get(IngredientService);
  prismaService = moduleRef.get(PRISMA_CLIENT);
  ingredientCachingService = moduleRef.get(IngredientCachingService);
});

describe('store cache ingredients', () => {
  it('store cache ingredients success', async () => {
    expect.hasAssertions();
    const findMany = jest.spyOn(prismaService.ingredient, 'findMany').mockResolvedValue(ingredients);
    const redisStoreAllIngredients = jest.spyOn(ingredientCachingService, 'storeAllIngredients');
    await expect((ingredientService as any).storeCacheIngredients()).resolves.toEqual(ingredients);
    expect(findMany).toHaveBeenCalledTimes(1);
    expect(findMany).toHaveBeenCalledWith({ select });
    expect(redisStoreAllIngredients).toHaveBeenCalledTimes(1);
    expect(redisStoreAllIngredients).toHaveBeenCalledWith(ingredients);
  });

  it('store cache ingredients failed with findMany got unknown error', async () => {
    expect.hasAssertions();
    const findMany = jest.spyOn(prismaService.ingredient, 'findMany').mockRejectedValue(UnknownError);
    const redisStoreAllIngredients = jest.spyOn(ingredientCachingService, 'storeAllIngredients');
    await expect((ingredientService as any).storeCacheIngredients()).rejects.toThrow(UnknownError);
    expect(findMany).toHaveBeenCalledTimes(1);
    expect(findMany).toHaveBeenCalledWith({ select });
    expect(redisStoreAllIngredients).not.toHaveBeenCalled();
  });

  it('store cache ingredients failed with findMany got database disconnect error', async () => {
    expect.hasAssertions();
    const findMany = jest.spyOn(prismaService.ingredient, 'findMany').mockRejectedValue(PrismaDisconnectError);
    const redisStoreAllIngredients = jest.spyOn(ingredientCachingService, 'storeAllIngredients');
    await expect((ingredientService as any).storeCacheIngredients()).rejects.toThrow(PrismaDisconnectError);
    expect(findMany).toHaveBeenCalledTimes(1);
    expect(findMany).toHaveBeenCalledWith({ select });
    expect(redisStoreAllIngredients).not.toHaveBeenCalled();
  });

  it('store cache ingredients failed with redisStoreAllIngredients got unknown error', async () => {
    expect.hasAssertions();
    const findMany = jest.spyOn(prismaService.ingredient, 'findMany').mockResolvedValue(ingredients);
    const redisStoreAllIngredients = jest
      .spyOn(ingredientCachingService, 'storeAllIngredients')
      .mockRejectedValue(UnknownError);
    await expect((ingredientService as any).storeCacheIngredients()).rejects.toThrow(UnknownError);
    expect(findMany).toHaveBeenCalledTimes(1);
    expect(findMany).toHaveBeenCalledWith({ select });
    expect(redisStoreAllIngredients).toHaveBeenCalledTimes(1);
    expect(redisStoreAllIngredients).toHaveBeenCalledWith(ingredients);
  });
});

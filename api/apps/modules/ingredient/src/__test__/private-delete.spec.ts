import { PrismaClient } from 'generated/prisma';
import IngredientService from '../ingredient.service';
import { PrismaDisconnectError, PrismaNotFoundError } from '@share/test/pre-setup/mock/errors/prisma-errors';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import startUp from './pre-setup';
import { ingredient } from '@share/test/pre-setup/mock/data/ingredient';
import { PRISMA_CLIENT } from '@share/di-token';

let ingredientService: IngredientService;
let prismaService: PrismaClient;
const ingredientId = ingredient.ingredient_id;

beforeEach(async () => {
  const moduleRef = await startUp();

  ingredientService = moduleRef.get(IngredientService);
  prismaService = moduleRef.get(PRISMA_CLIENT);
});

describe('directly delete ingredient', () => {
  it('directly delete ingredient success', async () => {
    expect.hasAssertions();
    const productIngredientPrismaDeleteManyMethod = jest
      .spyOn(prismaService.product_ingredient, 'deleteMany')
      .mockResolvedValue({ count: 2 });
    const ingredientPrismaDeleteMethod = jest.spyOn(prismaService.ingredient, 'delete').mockResolvedValue(ingredient);
    const transactionPrismaMethod = jest.spyOn(prismaService, '$transaction').mockResolvedValue([2, ingredient]);
    const deleteIngredient = jest.spyOn(ingredientService as any, 'delete');
    await expect((ingredientService as any).delete(ingredientId)).resolves.toBe(ingredient);
    expect(deleteIngredient).toHaveBeenCalledTimes(1);
    expect(deleteIngredient).toHaveBeenCalledWith(ingredientId);
    expect(transactionPrismaMethod).toHaveBeenCalledTimes(1);
    expect(transactionPrismaMethod).toHaveBeenCalledWith(expect.any(Array));
    expect(productIngredientPrismaDeleteManyMethod).toHaveBeenCalledTimes(1);
    expect(productIngredientPrismaDeleteManyMethod).toHaveBeenCalledWith({
      where: {
        ingredient_id: ingredientId,
      },
    });
    expect(ingredientPrismaDeleteMethod).toHaveBeenCalledTimes(1);
    expect(ingredientPrismaDeleteMethod).toHaveBeenCalledWith({
      where: {
        ingredient_id: ingredientId,
      },
    });
  });

  it('directly delete ingredient failed with not found error', async () => {
    expect.hasAssertions();
    const productIngredientPrismaDeleteManyMethod = jest.spyOn(prismaService.product_ingredient, 'deleteMany');
    const ingredientPrismaDeleteMethod = jest.spyOn(prismaService.ingredient, 'delete').mockResolvedValue(ingredient);
    const transactionPrismaMethod = jest.spyOn(prismaService, '$transaction').mockRejectedValue(PrismaNotFoundError);
    const deleteIngredient = jest.spyOn(ingredientService as any, 'delete');
    await expect((ingredientService as any).delete(ingredientId)).rejects.toThrow(PrismaNotFoundError);
    expect(deleteIngredient).toHaveBeenCalledTimes(1);
    expect(deleteIngredient).toHaveBeenCalledWith(ingredientId);
    expect(transactionPrismaMethod).toHaveBeenCalledTimes(1);
    expect(transactionPrismaMethod).toHaveBeenCalledWith(expect.any(Array));
    expect(productIngredientPrismaDeleteManyMethod).toHaveBeenCalledTimes(1);
    expect(productIngredientPrismaDeleteManyMethod).toHaveBeenCalledWith({
      where: {
        ingredient_id: ingredientId,
      },
    });
    expect(ingredientPrismaDeleteMethod).toHaveBeenCalledTimes(1);
    expect(ingredientPrismaDeleteMethod).toHaveBeenCalledWith({
      where: {
        ingredient_id: ingredientId,
      },
    });
  });

  it('directly delete ingredient failed with unknown error', async () => {
    expect.hasAssertions();
    const productIngredientPrismaDeleteManyMethod = jest
      .spyOn(prismaService.product_ingredient, 'deleteMany')
      .mockResolvedValue({ count: 2 });
    const ingredientPrismaDeleteMethod = jest.spyOn(prismaService.ingredient, 'delete').mockResolvedValue(ingredient);
    const transactionPrismaMethod = jest.spyOn(prismaService, '$transaction').mockRejectedValue(UnknownError);
    const deleteIngredient = jest.spyOn(ingredientService as any, 'delete');
    await expect((ingredientService as any).delete(ingredientId)).rejects.toThrow(UnknownError);
    expect(deleteIngredient).toHaveBeenCalledTimes(1);
    expect(deleteIngredient).toHaveBeenCalledWith(ingredientId);
    expect(transactionPrismaMethod).toHaveBeenCalledTimes(1);
    expect(transactionPrismaMethod).toHaveBeenCalledWith(expect.any(Array));
    expect(productIngredientPrismaDeleteManyMethod).toHaveBeenCalledTimes(1);
    expect(productIngredientPrismaDeleteManyMethod).toHaveBeenCalledWith({
      where: {
        ingredient_id: ingredientId,
      },
    });
    expect(ingredientPrismaDeleteMethod).toHaveBeenCalledTimes(1);
    expect(ingredientPrismaDeleteMethod).toHaveBeenCalledWith({
      where: {
        ingredient_id: ingredientId,
      },
    });
  });

  it('directly delete ingredient failed with database disconnect error', async () => {
    expect.hasAssertions();
    const productIngredientPrismaDeleteManyMethod = jest
      .spyOn(prismaService.product_ingredient, 'deleteMany')
      .mockResolvedValue({ count: 2 });
    const ingredientPrismaDeleteMethod = jest.spyOn(prismaService.ingredient, 'delete').mockResolvedValue(ingredient);
    const transactionPrismaMethod = jest.spyOn(prismaService, '$transaction').mockRejectedValue(PrismaDisconnectError);
    const deleteIngredient = jest.spyOn(ingredientService as any, 'delete');
    await expect((ingredientService as any).delete(ingredientId)).rejects.toThrow(PrismaDisconnectError);
    expect(deleteIngredient).toHaveBeenCalledTimes(1);
    expect(deleteIngredient).toHaveBeenCalledWith(ingredientId);
    expect(transactionPrismaMethod).toHaveBeenCalledTimes(1);
    expect(transactionPrismaMethod).toHaveBeenCalledWith(expect.any(Array));
    expect(productIngredientPrismaDeleteManyMethod).toHaveBeenCalledTimes(1);
    expect(productIngredientPrismaDeleteManyMethod).toHaveBeenCalledWith({
      where: {
        ingredient_id: ingredientId,
      },
    });
    expect(ingredientPrismaDeleteMethod).toHaveBeenCalledTimes(1);
    expect(ingredientPrismaDeleteMethod).toHaveBeenCalledWith({
      where: {
        ingredient_id: ingredientId,
      },
    });
  });
});

import { PrismaClient } from 'generated/prisma';
import IngredientService from '../ingredient.service';
import { PrismaDisconnectError, PrismaNotFoundError } from '@share/test/pre-setup/mock/errors/prisma-errors';
import startUp from './pre-setup';
import { ingredient, createProductIngredientDatabaseList } from '@share/test/pre-setup/mock/data/ingredient';
import { PRISMA_CLIENT } from '@share/di-token';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';

let ingredientService: IngredientService;
let prismaService: PrismaClient;
const ingredientId = ingredient.ingredient_id;
const productIngredients: any = createProductIngredientDatabaseList(2);
const productIds: string[] = productIngredients.map((item: any) => item.ingredient_id);

beforeEach(async () => {
  const moduleRef = await startUp();

  ingredientService = moduleRef.get(IngredientService);
  prismaService = moduleRef.get(PRISMA_CLIENT);
});

afterEach((done) => {
  jest.restoreAllMocks();
  jest.resetAllMocks();
  done();
});

describe('directly delete ingredient', () => {
  it('directly delete ingredient success', async () => {
    expect.hasAssertions();
    const productIngredientPrismaFindManyMethod = jest
      .spyOn(prismaService.product_ingredient, 'findMany')
      .mockResolvedValue(productIngredients);
    const productIngredientPrismaDeleteManyMethod = jest
      .spyOn(prismaService.product_ingredient, 'deleteMany')
      .mockResolvedValue({ count: 2 });
    const ingredientPrismaDeleteMethod = jest.spyOn(prismaService.ingredient, 'delete').mockResolvedValue(ingredient);
    const productPrismaDeleteManyMethod = jest
      .spyOn(prismaService.product, 'deleteMany')
      .mockResolvedValue({ count: 2 });
    const transactionPrismaMethod = jest.spyOn(prismaService, '$transaction').mockResolvedValue([2, ingredient, 2]);
    const deleteIngredient = jest.spyOn(ingredientService as any, 'delete');
    await expect((ingredientService as any).delete(ingredientId)).resolves.toBe(ingredient);
    expect(deleteIngredient).toHaveBeenCalledTimes(1);
    expect(deleteIngredient).toHaveBeenCalledWith(ingredientId);
    expect(productIngredientPrismaFindManyMethod).toHaveBeenCalledTimes(1);
    expect(productIngredientPrismaFindManyMethod).toHaveBeenCalledWith({
      where: {
        ingredient_id: ingredientId,
      },
      select: {
        product_id: true,
      },
    });
    expect(transactionPrismaMethod).toHaveBeenCalledTimes(1);
    expect(transactionPrismaMethod).toHaveBeenCalledWith(expect.any(Array));
    expect(productIngredientPrismaDeleteManyMethod).toHaveBeenCalledTimes(1);
    expect(productIngredientPrismaDeleteManyMethod).toHaveBeenCalledWith({
      where: {
        product_id: {
          in: productIds,
        },
      },
    });
    expect(ingredientPrismaDeleteMethod).toHaveBeenCalledTimes(1);
    expect(ingredientPrismaDeleteMethod).toHaveBeenCalledWith({
      where: {
        ingredient_id: ingredientId,
      },
    });
    expect(productPrismaDeleteManyMethod).toHaveBeenCalledTimes(1);
    expect(productPrismaDeleteManyMethod).toHaveBeenCalledWith({
      where: {
        product_id: {
          in: productIds,
        },
      },
    });
  });

  it('directly delete ingredient failed with productIngredient findMany got not found error', async () => {
    expect.hasAssertions();
    const productIngredientPrismaFindManyMethod = jest
      .spyOn(prismaService.product_ingredient, 'findMany')
      .mockRejectedValue(PrismaNotFoundError);
    const productIngredientPrismaDeleteManyMethod = jest
      .spyOn(prismaService.product_ingredient, 'deleteMany')
      .mockResolvedValue({ count: 2 });
    const ingredientPrismaDeleteMethod = jest.spyOn(prismaService.ingredient, 'delete').mockResolvedValue(ingredient);
    const productPrismaDeleteManyMethod = jest
      .spyOn(prismaService.product, 'deleteMany')
      .mockResolvedValue({ count: 2 });
    const transactionPrismaMethod = jest.spyOn(prismaService, '$transaction');
    const deleteIngredient = jest.spyOn(ingredientService as any, 'delete');
    await expect((ingredientService as any).delete(ingredientId)).rejects.toThrow(PrismaNotFoundError);
    expect(deleteIngredient).toHaveBeenCalledTimes(1);
    expect(deleteIngredient).toHaveBeenCalledWith(ingredientId);
    expect(productIngredientPrismaFindManyMethod).toHaveBeenCalledTimes(1);
    expect(productIngredientPrismaFindManyMethod).toHaveBeenCalledWith({
      where: {
        ingredient_id: ingredientId,
      },
      select: {
        product_id: true,
      },
    });
    expect(transactionPrismaMethod).not.toHaveBeenCalled();
    expect(productIngredientPrismaDeleteManyMethod).not.toHaveBeenCalled();
    expect(ingredientPrismaDeleteMethod).not.toHaveBeenCalled();
    expect(productPrismaDeleteManyMethod).not.toHaveBeenCalled();
  });

  it('directly delete ingredient failed with transaction got not found error', async () => {
    expect.hasAssertions();
    const productIngredientPrismaFindManyMethod = jest
      .spyOn(prismaService.product_ingredient, 'findMany')
      .mockResolvedValue(productIngredients);
    const productIngredientPrismaDeleteManyMethod = jest
      .spyOn(prismaService.product_ingredient, 'deleteMany')
      .mockResolvedValue({ count: 2 });
    const ingredientPrismaDeleteMethod = jest.spyOn(prismaService.ingredient, 'delete').mockResolvedValue(ingredient);
    const productPrismaDeleteManyMethod = jest
      .spyOn(prismaService.product, 'deleteMany')
      .mockResolvedValue({ count: 2 });
    const transactionPrismaMethod = jest.spyOn(prismaService, '$transaction').mockRejectedValue(PrismaNotFoundError);
    const deleteIngredient = jest.spyOn(ingredientService as any, 'delete');
    await expect((ingredientService as any).delete(ingredientId)).rejects.toThrow(PrismaNotFoundError);
    expect(deleteIngredient).toHaveBeenCalledTimes(1);
    expect(deleteIngredient).toHaveBeenCalledWith(ingredientId);
    expect(productIngredientPrismaFindManyMethod).toHaveBeenCalledTimes(1);
    expect(productIngredientPrismaFindManyMethod).toHaveBeenCalledWith({
      where: {
        ingredient_id: ingredientId,
      },
      select: {
        product_id: true,
      },
    });
    expect(transactionPrismaMethod).toHaveBeenCalledTimes(1);
    expect(transactionPrismaMethod).toHaveBeenCalledWith(expect.any(Array));
    expect(productIngredientPrismaDeleteManyMethod).toHaveBeenCalledTimes(1);
    expect(productIngredientPrismaDeleteManyMethod).toHaveBeenCalledWith({
      where: {
        product_id: {
          in: productIds,
        },
      },
    });
    expect(ingredientPrismaDeleteMethod).toHaveBeenCalledTimes(1);
    expect(ingredientPrismaDeleteMethod).toHaveBeenCalledWith({
      where: {
        ingredient_id: ingredientId,
      },
    });
    expect(productPrismaDeleteManyMethod).toHaveBeenCalledTimes(1);
    expect(productPrismaDeleteManyMethod).toHaveBeenCalledWith({
      where: {
        product_id: {
          in: productIds,
        },
      },
    });
  });

  it('directly delete ingredient failed with unknown error', async () => {
    expect.hasAssertions();
    const productIngredientPrismaFindManyMethod = jest
      .spyOn(prismaService.product_ingredient, 'findMany')
      .mockRejectedValue(UnknownError);
    const productIngredientPrismaDeleteManyMethod = jest
      .spyOn(prismaService.product_ingredient, 'deleteMany')
      .mockResolvedValue({ count: 2 });
    const ingredientPrismaDeleteMethod = jest.spyOn(prismaService.ingredient, 'delete').mockResolvedValue(ingredient);
    const productPrismaDeleteManyMethod = jest
      .spyOn(prismaService.product, 'deleteMany')
      .mockResolvedValue({ count: 2 });
    const transactionPrismaMethod = jest.spyOn(prismaService, '$transaction').mockResolvedValue([2, ingredient, 2]);
    const deleteIngredient = jest.spyOn(ingredientService as any, 'delete');
    await expect((ingredientService as any).delete(ingredientId)).rejects.toThrow(UnknownError);
    expect(deleteIngredient).toHaveBeenCalledTimes(1);
    expect(deleteIngredient).toHaveBeenCalledWith(ingredientId);
    expect(productIngredientPrismaFindManyMethod).toHaveBeenCalledTimes(1);
    expect(productIngredientPrismaFindManyMethod).toHaveBeenCalledWith({
      where: {
        ingredient_id: ingredientId,
      },
      select: {
        product_id: true,
      },
    });
    expect(transactionPrismaMethod).not.toHaveBeenCalled();
    expect(productIngredientPrismaDeleteManyMethod).not.toHaveBeenCalled();
    expect(ingredientPrismaDeleteMethod).not.toHaveBeenCalled();
    expect(productPrismaDeleteManyMethod).not.toHaveBeenCalled();
  });

  it('directly delete ingredient failed with transaction got unknown error', async () => {
    expect.hasAssertions();
    const productIngredientPrismaFindManyMethod = jest
      .spyOn(prismaService.product_ingredient, 'findMany')
      .mockResolvedValue(productIngredients);
    const productIngredientPrismaDeleteManyMethod = jest
      .spyOn(prismaService.product_ingredient, 'deleteMany')
      .mockResolvedValue({ count: 2 });
    const ingredientPrismaDeleteMethod = jest.spyOn(prismaService.ingredient, 'delete').mockResolvedValue(ingredient);
    const productPrismaDeleteManyMethod = jest
      .spyOn(prismaService.product, 'deleteMany')
      .mockResolvedValue({ count: 2 });
    const transactionPrismaMethod = jest.spyOn(prismaService, '$transaction').mockRejectedValue(UnknownError);
    const deleteIngredient = jest.spyOn(ingredientService as any, 'delete');
    await expect((ingredientService as any).delete(ingredientId)).rejects.toThrow(UnknownError);
    expect(deleteIngredient).toHaveBeenCalledTimes(1);
    expect(deleteIngredient).toHaveBeenCalledWith(ingredientId);
    expect(productIngredientPrismaFindManyMethod).toHaveBeenCalledTimes(1);
    expect(productIngredientPrismaFindManyMethod).toHaveBeenCalledWith({
      where: {
        ingredient_id: ingredientId,
      },
      select: {
        product_id: true,
      },
    });
    expect(transactionPrismaMethod).toHaveBeenCalledTimes(1);
    expect(transactionPrismaMethod).toHaveBeenCalledWith(expect.any(Array));
    expect(productIngredientPrismaDeleteManyMethod).toHaveBeenCalledTimes(1);
    expect(productIngredientPrismaDeleteManyMethod).toHaveBeenCalledWith({
      where: {
        product_id: {
          in: productIds,
        },
      },
    });
    expect(ingredientPrismaDeleteMethod).toHaveBeenCalledTimes(1);
    expect(ingredientPrismaDeleteMethod).toHaveBeenCalledWith({
      where: {
        ingredient_id: ingredientId,
      },
    });
    expect(productPrismaDeleteManyMethod).toHaveBeenCalledTimes(1);
    expect(productPrismaDeleteManyMethod).toHaveBeenCalledWith({
      where: {
        product_id: {
          in: productIds,
        },
      },
    });
  });

  it('directly delete ingredient failed with database disconnect error', async () => {
    expect.hasAssertions();
    const productIngredientPrismaFindManyMethod = jest
      .spyOn(prismaService.product_ingredient, 'findMany')
      .mockRejectedValue(PrismaDisconnectError);
    const productIngredientPrismaDeleteManyMethod = jest
      .spyOn(prismaService.product_ingredient, 'deleteMany')
      .mockResolvedValue({ count: 2 });
    const ingredientPrismaDeleteMethod = jest.spyOn(prismaService.ingredient, 'delete').mockResolvedValue(ingredient);
    const productPrismaDeleteManyMethod = jest
      .spyOn(prismaService.product, 'deleteMany')
      .mockResolvedValue({ count: 2 });
    const transactionPrismaMethod = jest.spyOn(prismaService, '$transaction');
    const deleteIngredient = jest.spyOn(ingredientService as any, 'delete');
    await expect((ingredientService as any).delete(ingredientId)).rejects.toThrow(PrismaDisconnectError);
    expect(deleteIngredient).toHaveBeenCalledTimes(1);
    expect(deleteIngredient).toHaveBeenCalledWith(ingredientId);
    expect(productIngredientPrismaFindManyMethod).toHaveBeenCalledTimes(1);
    expect(productIngredientPrismaFindManyMethod).toHaveBeenCalledWith({
      where: {
        ingredient_id: ingredientId,
      },
      select: {
        product_id: true,
      },
    });
    expect(transactionPrismaMethod).not.toHaveBeenCalled();
    expect(productIngredientPrismaDeleteManyMethod).not.toHaveBeenCalled();
    expect(ingredientPrismaDeleteMethod).not.toHaveBeenCalled();
    expect(productPrismaDeleteManyMethod).not.toHaveBeenCalled();
  });
});

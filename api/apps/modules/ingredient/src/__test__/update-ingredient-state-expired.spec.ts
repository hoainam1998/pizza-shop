import { PrismaClient, Status } from 'generated/prisma';
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

describe('update ingredient state expired', () => {
  it('update ingredient state expired success', async () => {
    expect.hasAssertions();
    const ingredientPrismaUpdateMethod = jest.spyOn(prismaService.ingredient, 'update').mockResolvedValue(ingredient);
    const updateIngredientStateExpired = jest.spyOn(ingredientService as any, 'updateIngredientStateExpired');
    await expect((ingredientService as any).updateIngredientStateExpired(ingredientId)).resolves.toBe(ingredient);
    expect(updateIngredientStateExpired).toHaveBeenCalledTimes(1);
    expect(updateIngredientStateExpired).toHaveBeenCalledWith(ingredientId);
    expect(ingredientPrismaUpdateMethod).toHaveBeenCalledTimes(1);
    expect(ingredientPrismaUpdateMethod).toHaveBeenCalledWith({
      where: {
        ingredient_id: ingredientId,
      },
      data: {
        status: Status.EXPIRED,
      },
    });
  });

  it('update ingredient state expired failed with not found error', async () => {
    expect.hasAssertions();
    const ingredientPrismaUpdateMethod = jest
      .spyOn(prismaService.ingredient, 'update')
      .mockRejectedValue(PrismaNotFoundError);
    const updateIngredientStateExpired = jest.spyOn(ingredientService as any, 'updateIngredientStateExpired');
    await expect((ingredientService as any).updateIngredientStateExpired(ingredientId)).rejects.toThrow(
      PrismaNotFoundError,
    );
    expect(updateIngredientStateExpired).toHaveBeenCalledTimes(1);
    expect(updateIngredientStateExpired).toHaveBeenCalledWith(ingredientId);
    expect(ingredientPrismaUpdateMethod).toHaveBeenCalledTimes(1);
    expect(ingredientPrismaUpdateMethod).toHaveBeenCalledWith({
      where: {
        ingredient_id: ingredientId,
      },
      data: {
        status: Status.EXPIRED,
      },
    });
  });

  it('update ingredient state expired failed with unknown error', async () => {
    expect.hasAssertions();
    const ingredientPrismaUpdateMethod = jest.spyOn(prismaService.ingredient, 'update').mockRejectedValue(UnknownError);
    const updateIngredientStateExpired = jest.spyOn(ingredientService as any, 'updateIngredientStateExpired');
    await expect((ingredientService as any).updateIngredientStateExpired(ingredientId)).rejects.toThrow(UnknownError);
    expect(updateIngredientStateExpired).toHaveBeenCalledTimes(1);
    expect(updateIngredientStateExpired).toHaveBeenCalledWith(ingredientId);
    expect(ingredientPrismaUpdateMethod).toHaveBeenCalledTimes(1);
    expect(ingredientPrismaUpdateMethod).toHaveBeenCalledWith({
      where: {
        ingredient_id: ingredientId,
      },
      data: {
        status: Status.EXPIRED,
      },
    });
  });

  it('update ingredient state expired failed with database disconnect error', async () => {
    expect.hasAssertions();
    const ingredientPrismaUpdateMethod = jest
      .spyOn(prismaService.ingredient, 'update')
      .mockRejectedValue(PrismaDisconnectError);
    const updateIngredientStateExpired = jest.spyOn(ingredientService as any, 'updateIngredientStateExpired');
    await expect((ingredientService as any).updateIngredientStateExpired(ingredientId)).rejects.toThrow(
      PrismaDisconnectError,
    );
    expect(updateIngredientStateExpired).toHaveBeenCalledTimes(1);
    expect(updateIngredientStateExpired).toHaveBeenCalledWith(ingredientId);
    expect(ingredientPrismaUpdateMethod).toHaveBeenCalledTimes(1);
    expect(ingredientPrismaUpdateMethod).toHaveBeenCalledWith({
      where: {
        ingredient_id: ingredientId,
      },
      data: {
        status: Status.EXPIRED,
      },
    });
  });
});

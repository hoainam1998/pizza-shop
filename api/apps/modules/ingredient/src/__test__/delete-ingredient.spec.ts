import { BadRequestException, NotFoundException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaClient } from 'generated/prisma';
import IngredientService from '../ingredient.service';
import IngredientCachingService from '@share/libs/caching/ingredient/ingredient.service';
import SchedulerService from '@share/libs/scheduler/scheduler.service';
import { PrismaDisconnectError, PrismaNotFoundError } from '@share/test/pre-setup/mock/errors/prisma-errors';
import { PRISMA_CLIENT } from '@share/di-token';
import startUp from './pre-setup';
import { ingredient } from '@share/test/pre-setup/mock/data/ingredient';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import { createMessage } from '@share/utils';
import messages from '@share/constants/messages';

let ingredientService: IngredientService;
let schedulerService: SchedulerService;
let prismaService: PrismaClient;
let ingredientCachingService: IngredientCachingService;
const ingredientId = ingredient.ingredient_id;
const count = { count: 2 };

beforeEach(async () => {
  const moduleRef = await startUp();

  ingredientService = moduleRef.get(IngredientService);
  schedulerService = moduleRef.get(SchedulerService);
  prismaService = moduleRef.get(PRISMA_CLIENT);
  ingredientCachingService = moduleRef.get(IngredientCachingService);
});

describe('delete ingredient', () => {
  it('delete ingredient success', async () => {
    expect.hasAssertions();
    const deleteManyProductIngredient = jest.spyOn(prismaService.product_ingredient, 'deleteMany');
    const deleteIngredient = jest.spyOn(prismaService.ingredient, 'delete');
    const transaction = jest.spyOn(prismaService, '$transaction').mockResolvedValue([count, ingredient]);
    const deleteScheduler = jest.spyOn(schedulerService, 'deleteScheduler').mockImplementation(() => jest.fn());
    const deleteAllIngredients = jest.spyOn(ingredientCachingService, 'deleteAllIngredients');
    await expect(ingredientService.deleteIngredient(ingredientId)).resolves.toBe(ingredient);
    expect(deleteManyProductIngredient).toHaveBeenCalledTimes(1);
    expect(deleteManyProductIngredient).toHaveBeenCalledWith({
      where: {
        ingredient_id: ingredientId,
      },
    });
    expect(deleteIngredient).toHaveBeenCalledTimes(1);
    expect(deleteIngredient).toHaveBeenCalledWith({
      where: {
        ingredient_id: ingredientId,
      },
    });
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(deleteScheduler).toHaveBeenCalledTimes(1);
    expect(deleteScheduler).toHaveBeenCalledWith((ingredientService as any)._jobName, expect.any(String));
    expect(deleteAllIngredients).toHaveBeenCalledTimes(1);
  });

  it('delete ingredient failed with not found error', async () => {
    expect.hasAssertions();
    const transaction = jest.spyOn(prismaService, '$transaction').mockRejectedValue(PrismaNotFoundError);
    const deleteManyProductIngredient = jest.spyOn(prismaService.product_ingredient, 'deleteMany');
    const deleteIngredient = jest.spyOn(prismaService.ingredient, 'delete');
    const deleteScheduler = jest.spyOn(schedulerService, 'deleteScheduler').mockImplementation(() => jest.fn());
    const deleteAllIngredients = jest.spyOn(ingredientCachingService, 'deleteAllIngredients');
    await expect(ingredientService.deleteIngredient(ingredientId)).rejects.toThrow(
      new RpcException(new NotFoundException(messages.INGREDIENT.NOT_FOUND)),
    );
    expect(deleteManyProductIngredient).toHaveBeenCalledTimes(1);
    expect(deleteManyProductIngredient).toHaveBeenCalledWith({
      where: {
        ingredient_id: ingredientId,
      },
    });
    expect(deleteIngredient).toHaveBeenCalledTimes(1);
    expect(deleteIngredient).toHaveBeenCalledWith({
      where: {
        ingredient_id: ingredientId,
      },
    });
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(deleteScheduler).not.toHaveBeenCalled();
    expect(deleteAllIngredients).not.toHaveBeenCalled();
  });

  it('delete ingredient failed with private delete got unknown error', async () => {
    expect.hasAssertions();
    const transaction = jest.spyOn(prismaService, '$transaction').mockRejectedValue(UnknownError);
    const deleteManyProductIngredient = jest.spyOn(prismaService.product_ingredient, 'deleteMany');
    const deleteIngredient = jest.spyOn(prismaService.ingredient, 'delete');
    const deleteScheduler = jest.spyOn(schedulerService, 'deleteScheduler').mockImplementation(() => jest.fn());
    const deleteAllIngredients = jest.spyOn(ingredientCachingService, 'deleteAllIngredients');
    await expect(ingredientService.deleteIngredient(ingredientId)).rejects.toThrow(UnknownError);
    expect(deleteManyProductIngredient).toHaveBeenCalledTimes(1);
    expect(deleteManyProductIngredient).toHaveBeenCalledWith({
      where: {
        ingredient_id: ingredientId,
      },
    });
    expect(deleteIngredient).toHaveBeenCalledTimes(1);
    expect(deleteIngredient).toHaveBeenCalledWith({
      where: {
        ingredient_id: ingredientId,
      },
    });
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(deleteScheduler).not.toHaveBeenCalled();
    expect(deleteAllIngredients).not.toHaveBeenCalled();
  });

  it('delete ingredient failed with deleteScheduler got unknown error', async () => {
    expect.hasAssertions();
    const deleteManyProductIngredient = jest.spyOn(prismaService.product_ingredient, 'deleteMany');
    const deleteIngredient = jest.spyOn(prismaService.ingredient, 'delete');
    const transaction = jest.spyOn(prismaService, '$transaction').mockResolvedValue([count, ingredient]);
    const deleteScheduler = jest.spyOn(schedulerService, 'deleteScheduler').mockImplementation(() => {
      throw UnknownError;
    });
    const deleteAllIngredients = jest.spyOn(ingredientCachingService, 'deleteAllIngredients');
    await expect(ingredientService.deleteIngredient(ingredientId)).rejects.toThrow(UnknownError);
    expect(deleteManyProductIngredient).toHaveBeenCalledTimes(1);
    expect(deleteManyProductIngredient).toHaveBeenCalledWith({
      where: {
        ingredient_id: ingredientId,
      },
    });
    expect(deleteIngredient).toHaveBeenCalledTimes(1);
    expect(deleteIngredient).toHaveBeenCalledWith({
      where: {
        ingredient_id: ingredientId,
      },
    });
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(deleteScheduler).toHaveBeenCalledTimes(1);
    expect(deleteScheduler).toHaveBeenCalledWith((ingredientService as any)._jobName, expect.any(String));
    expect(deleteAllIngredients).not.toHaveBeenCalled();
  });

  it('delete ingredient failed with deleteAllIngredients got unknown error', async () => {
    expect.hasAssertions();
    const deleteManyProductIngredient = jest.spyOn(prismaService.product_ingredient, 'deleteMany');
    const deleteIngredient = jest.spyOn(prismaService.ingredient, 'delete');
    const transaction = jest.spyOn(prismaService, '$transaction').mockResolvedValue([count, ingredient]);
    const deleteScheduler = jest.spyOn(schedulerService, 'deleteScheduler').mockImplementation(() => jest.fn());
    const deleteAllIngredients = jest
      .spyOn(ingredientCachingService, 'deleteAllIngredients')
      .mockRejectedValue(UnknownError);
    await expect(ingredientService.deleteIngredient(ingredientId)).rejects.toThrow(UnknownError);
    expect(deleteManyProductIngredient).toHaveBeenCalledTimes(1);
    expect(deleteManyProductIngredient).toHaveBeenCalledWith({
      where: {
        ingredient_id: ingredientId,
      },
    });
    expect(deleteIngredient).toHaveBeenCalledTimes(1);
    expect(deleteIngredient).toHaveBeenCalledWith({
      where: {
        ingredient_id: ingredientId,
      },
    });
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(deleteScheduler).toHaveBeenCalledTimes(1);
    expect(deleteScheduler).toHaveBeenCalledWith((ingredientService as any)._jobName, expect.any(String));
    expect(deleteAllIngredients).toHaveBeenCalledTimes(1);
  });

  it('delete ingredient failed with private delete got database disconnect error', async () => {
    expect.hasAssertions();
    const deleteManyProductIngredient = jest.spyOn(prismaService.product_ingredient, 'deleteMany');
    const deleteIngredient = jest.spyOn(prismaService.ingredient, 'delete');
    const transaction = jest.spyOn(prismaService, '$transaction').mockRejectedValue(PrismaDisconnectError);
    const deleteScheduler = jest.spyOn(schedulerService, 'deleteScheduler').mockImplementation(() => jest.fn());
    const deleteAllIngredients = jest.spyOn(ingredientCachingService, 'deleteAllIngredients');
    await expect(ingredientService.deleteIngredient(ingredientId)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(PrismaDisconnectError.message))),
    );
    expect(deleteManyProductIngredient).toHaveBeenCalledTimes(1);
    expect(deleteManyProductIngredient).toHaveBeenCalledWith({
      where: {
        ingredient_id: ingredientId,
      },
    });
    expect(deleteIngredient).toHaveBeenCalledTimes(1);
    expect(deleteIngredient).toHaveBeenCalledWith({
      where: {
        ingredient_id: ingredientId,
      },
    });
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(deleteScheduler).not.toHaveBeenCalled();
    expect(deleteAllIngredients).not.toHaveBeenCalled();
  });
});

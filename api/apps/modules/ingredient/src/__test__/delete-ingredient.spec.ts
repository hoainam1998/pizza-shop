import { BadRequestException, NotFoundException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import IngredientService from '../ingredient.service';
import IngredientCachingService from '@share/libs/caching/ingredient/ingredient.service';
import SchedulerService from '@share/libs/scheduler/scheduler.service';
import { PrismaDisconnectError, PrismaNotFoundError } from '@share/test/pre-setup/mock/errors/prisma-errors';
import startUp from './pre-setup';
import { ingredient } from '@share/test/pre-setup/mock/data/ingredient';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import { createMessage } from '@share/utils';
import messages from '@share/constants/messages';

let ingredientService: IngredientService;
let schedulerService: SchedulerService;
let ingredientCachingService: IngredientCachingService;
const ingredientId = ingredient.ingredient_id;

beforeEach(async () => {
  const moduleRef = await startUp();

  ingredientService = moduleRef.get(IngredientService);
  schedulerService = moduleRef.get(SchedulerService);
  ingredientCachingService = moduleRef.get(IngredientCachingService);
});

describe('delete ingredient', () => {
  it('delete ingredient success', async () => {
    const privateDelete = jest.spyOn(ingredientService as any, 'delete').mockResolvedValue(ingredient);
    const deleteScheduler = jest.spyOn(schedulerService, 'deleteScheduler').mockImplementation(() => jest.fn());
    const deleteAllIngredients = jest.spyOn(ingredientCachingService, 'deleteAllIngredients');
    await expect(ingredientService.deleteIngredient(ingredientId)).resolves.toBe(ingredient);
    expect(privateDelete).toHaveBeenCalledTimes(1);
    expect(privateDelete).toHaveBeenCalledWith(ingredientId);
    expect(deleteScheduler).toHaveBeenCalledTimes(1);
    expect(deleteScheduler).toHaveBeenCalledWith((ingredientService as any)._jobName, expect.any(String));
    expect(deleteAllIngredients).toHaveBeenCalledTimes(1);
  });

  it('delete ingredient failed with not found error', async () => {
    const privateDelete = jest.spyOn(ingredientService as any, 'delete').mockRejectedValue(PrismaNotFoundError);
    const deleteScheduler = jest.spyOn(schedulerService, 'deleteScheduler').mockImplementation(() => jest.fn());
    const deleteAllIngredients = jest.spyOn(ingredientCachingService, 'deleteAllIngredients');
    await expect(ingredientService.deleteIngredient(ingredientId)).rejects.toThrow(
      new RpcException(new NotFoundException(messages.INGREDIENT.NOT_FOUND)),
    );
    expect(privateDelete).toHaveBeenCalledTimes(1);
    expect(privateDelete).toHaveBeenCalledWith(ingredientId);
    expect(deleteScheduler).not.toHaveBeenCalled();
    expect(deleteAllIngredients).not.toHaveBeenCalled();
  });

  it('delete ingredient failed with private delete got unknown error', async () => {
    const privateDelete = jest.spyOn(ingredientService as any, 'delete').mockRejectedValue(UnknownError);
    const deleteScheduler = jest.spyOn(schedulerService, 'deleteScheduler').mockImplementation(() => jest.fn());
    const deleteAllIngredients = jest.spyOn(ingredientCachingService, 'deleteAllIngredients');
    await expect(ingredientService.deleteIngredient(ingredientId)).rejects.toThrow(UnknownError);
    expect(privateDelete).toHaveBeenCalledTimes(1);
    expect(privateDelete).toHaveBeenCalledWith(ingredientId);
    expect(deleteScheduler).not.toHaveBeenCalled();
    expect(deleteAllIngredients).not.toHaveBeenCalled();
  });

  it('delete ingredient failed with deleteScheduler got unknown error', async () => {
    const privateDelete = jest.spyOn(ingredientService as any, 'delete').mockResolvedValue(ingredient);
    const deleteScheduler = jest.spyOn(schedulerService, 'deleteScheduler').mockImplementation(() => {
      throw UnknownError;
    });
    const deleteAllIngredients = jest.spyOn(ingredientCachingService, 'deleteAllIngredients');
    await expect(ingredientService.deleteIngredient(ingredientId)).rejects.toThrow(UnknownError);
    expect(privateDelete).toHaveBeenCalledTimes(1);
    expect(privateDelete).toHaveBeenCalledWith(ingredientId);
    expect(deleteScheduler).toHaveBeenCalledTimes(1);
    expect(deleteScheduler).toHaveBeenCalledWith((ingredientService as any)._jobName, expect.any(String));
    expect(deleteAllIngredients).not.toHaveBeenCalled();
  });

  it('delete ingredient failed with deleteAllIngredients got unknown error', async () => {
    const privateDelete = jest.spyOn(ingredientService as any, 'delete').mockResolvedValue(ingredient);
    const deleteScheduler = jest.spyOn(schedulerService, 'deleteScheduler').mockImplementation(() => jest.fn());
    const deleteAllIngredients = jest
      .spyOn(ingredientCachingService, 'deleteAllIngredients')
      .mockRejectedValue(UnknownError);
    await expect(ingredientService.deleteIngredient(ingredientId)).rejects.toThrow(UnknownError);
    expect(privateDelete).toHaveBeenCalledTimes(1);
    expect(privateDelete).toHaveBeenCalledWith(ingredientId);
    expect(deleteScheduler).toHaveBeenCalledTimes(1);
    expect(deleteScheduler).toHaveBeenCalledWith((ingredientService as any)._jobName, expect.any(String));
    expect(deleteAllIngredients).toHaveBeenCalledTimes(1);
  });

  it('delete ingredient failed with private delete got database disconnect error', async () => {
    const privateDelete = jest.spyOn(ingredientService as any, 'delete').mockRejectedValue(PrismaDisconnectError);
    const deleteScheduler = jest.spyOn(schedulerService, 'deleteScheduler').mockImplementation(() => jest.fn());
    const deleteAllIngredients = jest.spyOn(ingredientCachingService, 'deleteAllIngredients');
    await expect(ingredientService.deleteIngredient(ingredientId)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(PrismaDisconnectError.message))),
    );
    expect(privateDelete).toHaveBeenCalledTimes(1);
    expect(privateDelete).toHaveBeenCalledWith(ingredientId);
    expect(deleteScheduler).not.toHaveBeenCalled();
    expect(deleteAllIngredients).not.toHaveBeenCalled();
  });
});

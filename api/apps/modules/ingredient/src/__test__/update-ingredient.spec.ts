import { RpcException } from '@nestjs/microservices';
import { PrismaClient } from 'generated/prisma';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import { PrismaDisconnectError, PrismaNotFoundError } from '@share/test/pre-setup/mock/errors/prisma-errors';
import startUp from './pre-setup';
import IngredientCachingService from '@share/libs/caching/ingredient/ingredient.service';
import IngredientController from '../ingredient.controller';
import IngredientService from '../ingredient.service';
import { ingredient } from '@share/test/pre-setup/mock/data/ingredient';
import { PRISMA_CLIENT } from '@share/di-token';
import LoggingService from '@share/libs/logging/logging.service';
import { createMessage } from '@share/utils';
import messages from '@share/constants/messages';

let ingredientController: IngredientController;
let ingredientService: IngredientService;
let prismaService: PrismaClient;
let loggerService: LoggingService;
let ingredientCachingService: IngredientCachingService;

beforeEach(async () => {
  const moduleRef = await startUp();

  ingredientService = moduleRef.get(IngredientService);
  ingredientController = moduleRef.get(IngredientController);
  loggerService = moduleRef.get(LoggingService);
  prismaService = moduleRef.get(PRISMA_CLIENT);
  ingredientCachingService = moduleRef.get(IngredientCachingService);
});

describe('update ingredient', () => {
  it('update ingredient was success', async () => {
    expect.hasAssertions();
    const deleteAllIngredients = jest.spyOn(ingredientCachingService, 'deleteAllIngredients').mockResolvedValue(1);
    const updateIngredientStateWhenExpired = jest.spyOn(ingredientService as any, 'updateIngredientStateWhenExpired');
    const updatePrismaMethod = jest.spyOn(prismaService.ingredient, 'update').mockResolvedValue(ingredient);
    const updateMethodService = jest.spyOn(ingredientService, 'updateIngredient');
    const updateMethodController = jest.spyOn(ingredientController, 'updateIngredient');
    await expect(ingredientController.updateIngredient(ingredient)).resolves.toBe(ingredient);
    expect(updateMethodController).toHaveBeenCalledTimes(1);
    expect(updateMethodController).toHaveBeenCalledWith(ingredient);
    expect(updateMethodService).toHaveBeenCalledTimes(1);
    expect(updateMethodService).toHaveBeenCalledWith(ingredient);
    expect(updatePrismaMethod).toHaveBeenCalledTimes(1);
    expect(updatePrismaMethod).toHaveBeenCalledWith({
      where: {
        ingredient_id: ingredient.ingredient_id,
      },
      data: {
        name: ingredient.name,
        avatar: ingredient.avatar,
        unit: ingredient.unit,
        count: ingredient.count,
        price: ingredient.price,
        expired_time: ingredient.expired_time,
      },
    });
    expect(deleteAllIngredients).toHaveBeenCalledTimes(1);
    expect(updateIngredientStateWhenExpired).toHaveBeenCalledTimes(1);
    expect(updateIngredientStateWhenExpired).toHaveBeenCalledWith(ingredient, expect.any(String));
  });

  it('update ingredient failed with not found error', async () => {
    expect.hasAssertions();
    const deleteAllIngredients = jest.spyOn(ingredientCachingService, 'deleteAllIngredients').mockResolvedValue(1);
    const updateIngredientStateWhenExpired = jest.spyOn(ingredientService as any, 'updateIngredientStateWhenExpired');
    const updatePrismaMethod = jest.spyOn(prismaService.ingredient, 'update').mockRejectedValue(PrismaNotFoundError);
    const updateMethodService = jest.spyOn(ingredientService, 'updateIngredient');
    const updateMethodController = jest.spyOn(ingredientController, 'updateIngredient');
    await expect(ingredientController.updateIngredient(ingredient)).rejects.toThrow(
      new RpcException(new NotFoundException(messages.INGREDIENT.NOT_FOUND)),
    );
    expect(updateMethodController).toHaveBeenCalledTimes(1);
    expect(updateMethodController).toHaveBeenCalledWith(ingredient);
    expect(updateMethodService).toHaveBeenCalledTimes(1);
    expect(updateMethodService).toHaveBeenCalledWith(ingredient);
    expect(updatePrismaMethod).toHaveBeenCalledTimes(1);
    expect(updatePrismaMethod).toHaveBeenCalledWith({
      where: {
        ingredient_id: ingredient.ingredient_id,
      },
      data: {
        name: ingredient.name,
        avatar: ingredient.avatar,
        unit: ingredient.unit,
        count: ingredient.count,
        price: ingredient.price,
        expired_time: ingredient.expired_time,
      },
    });
    expect(deleteAllIngredients).not.toHaveBeenCalled();
    expect(updateIngredientStateWhenExpired).not.toHaveBeenCalled();
  });

  it('update ingredient failed with unknown error', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const deleteAllIngredients = jest.spyOn(ingredientCachingService, 'deleteAllIngredients').mockResolvedValue(1);
    const updateIngredientStateWhenExpired = jest.spyOn(ingredientService as any, 'updateIngredientStateWhenExpired');
    const updatePrismaMethod = jest.spyOn(prismaService.ingredient, 'update').mockRejectedValue(UnknownError);
    const updateMethodService = jest.spyOn(ingredientService, 'updateIngredient');
    const updateMethodController = jest.spyOn(ingredientController, 'updateIngredient');
    await expect(ingredientController.updateIngredient(ingredient)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(messages.COMMON.COMMON_ERROR))),
    );
    expect(updateMethodController).toHaveBeenCalledTimes(1);
    expect(updateMethodController).toHaveBeenCalledWith(ingredient);
    expect(updateMethodService).toHaveBeenCalledTimes(1);
    expect(updateMethodService).toHaveBeenCalledWith(ingredient);
    expect(updatePrismaMethod).toHaveBeenCalledTimes(1);
    expect(updatePrismaMethod).toHaveBeenCalledWith({
      where: {
        ingredient_id: ingredient.ingredient_id,
      },
      data: {
        name: ingredient.name,
        avatar: ingredient.avatar,
        unit: ingredient.unit,
        count: ingredient.count,
        price: ingredient.price,
        expired_time: ingredient.expired_time,
      },
    });
    expect(deleteAllIngredients).not.toHaveBeenCalled();
    expect(updateIngredientStateWhenExpired).not.toHaveBeenCalled();
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(UnknownError.message, expect.any(String));
  });

  it('update ingredient failed with database disconnect error', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const deleteAllIngredients = jest.spyOn(ingredientCachingService, 'deleteAllIngredients').mockResolvedValue(1);
    const updateIngredientStateWhenExpired = jest.spyOn(ingredientService as any, 'updateIngredientStateWhenExpired');
    const updatePrismaMethod = jest.spyOn(prismaService.ingredient, 'update').mockRejectedValue(PrismaDisconnectError);
    const updateMethodService = jest.spyOn(ingredientService, 'updateIngredient');
    const updateMethodController = jest.spyOn(ingredientController, 'updateIngredient');
    await expect(ingredientController.updateIngredient(ingredient)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(PrismaDisconnectError.message))),
    );
    expect(updateMethodController).toHaveBeenCalledTimes(1);
    expect(updateMethodController).toHaveBeenCalledWith(ingredient);
    expect(updateMethodService).toHaveBeenCalledTimes(1);
    expect(updateMethodService).toHaveBeenCalledWith(ingredient);
    expect(updatePrismaMethod).toHaveBeenCalledTimes(1);
    expect(updatePrismaMethod).toHaveBeenCalledWith({
      where: {
        ingredient_id: ingredient.ingredient_id,
      },
      data: {
        name: ingredient.name,
        avatar: ingredient.avatar,
        unit: ingredient.unit,
        count: ingredient.count,
        price: ingredient.price,
        expired_time: ingredient.expired_time,
      },
    });
    expect(deleteAllIngredients).not.toHaveBeenCalled();
    expect(updateIngredientStateWhenExpired).not.toHaveBeenCalled();
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(PrismaDisconnectError.message, expect.any(String));
  });
});

import { PrismaClient } from 'generated/prisma';
import IngredientController from '../ingredient.controller';
import IngredientService from '../ingredient.service';
import LoggingService from '@share/libs/logging/logging.service';
import IngredientCachingService from '@share/libs/caching/ingredient/ingredient.service';
import { PrismaDisconnectError } from '@share/test/pre-setup/mock/errors/prisma-errors';
import { PRISMA_CLIENT } from '@share/di-token';
import startUp from './pre-setup';
import { ingredient } from '@share/test/pre-setup/mock/data/ingredient';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import { RpcException } from '@nestjs/microservices';
import { BadRequestException } from '@nestjs/common';
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

describe('create ingredient', () => {
  it('create ingredient success', async () => {
    expect.hasAssertions();
    const createIngredient = jest.spyOn(prismaService.ingredient, 'create').mockResolvedValue(ingredient);
    const updateIngredientStateWhenExpired = jest.spyOn(ingredientService as any, 'updateIngredientStateWhenExpired');
    const deleteAllIngredients = jest.spyOn(ingredientCachingService, 'deleteAllIngredients');
    const createIngredientControllerMethod = jest.spyOn(ingredientController, 'createIngredient');
    const createIngredientServiceMethod = jest.spyOn(ingredientService, 'createIngredient');
    await expect(ingredientController.createIngredient(ingredient)).resolves.toEqual(ingredient);
    expect(createIngredientControllerMethod).toHaveBeenCalledTimes(1);
    expect(createIngredientControllerMethod).toHaveBeenCalledWith(ingredient);
    expect(createIngredientServiceMethod).toHaveBeenCalledTimes(1);
    expect(createIngredientServiceMethod).toHaveBeenCalledWith(ingredient);
    expect(createIngredient).toHaveBeenCalledTimes(1);
    expect(createIngredient).toHaveBeenCalledWith({
      data: ingredient,
    });
    expect(deleteAllIngredients).toHaveBeenCalledTimes(1);
    expect(updateIngredientStateWhenExpired).toHaveBeenCalledTimes(1);
    expect(updateIngredientStateWhenExpired).toHaveBeenCalledWith(ingredient, expect.any(String));
  });

  it('create ingredient failed with create method got unknown error', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const createIngredient = jest.spyOn(prismaService.ingredient, 'create').mockRejectedValue(UnknownError);
    const updateIngredientStateWhenExpired = jest.spyOn(ingredientService as any, 'updateIngredientStateWhenExpired');
    const deleteAllIngredients = jest.spyOn(ingredientCachingService, 'deleteAllIngredients');
    const createIngredientControllerMethod = jest.spyOn(ingredientController, 'createIngredient');
    const createIngredientServiceMethod = jest.spyOn(ingredientService, 'createIngredient');
    await expect(ingredientController.createIngredient(ingredient)).rejects.toThrow(
      new RpcException(new BadRequestException(messages.COMMON.COMMON_ERROR)),
    );
    expect(createIngredientControllerMethod).toHaveBeenCalledTimes(1);
    expect(createIngredientControllerMethod).toHaveBeenCalledWith(ingredient);
    expect(createIngredientServiceMethod).toHaveBeenCalledTimes(1);
    expect(createIngredientServiceMethod).toHaveBeenCalledWith(ingredient);
    expect(createIngredient).toHaveBeenCalledTimes(1);
    expect(createIngredient).toHaveBeenCalledWith({
      data: ingredient,
    });
    expect(deleteAllIngredients).not.toHaveBeenCalled();
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(UnknownError.message, expect.any(String));
    expect(updateIngredientStateWhenExpired).not.toHaveBeenCalled();
  });

  it('create ingredient failed with deleteAllIngredients method got unknown error', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const createIngredient = jest.spyOn(prismaService.ingredient, 'create').mockResolvedValue(ingredient);
    const updateIngredientStateWhenExpired = jest.spyOn(ingredientService as any, 'updateIngredientStateWhenExpired');
    const deleteAllIngredients = jest
      .spyOn(ingredientCachingService, 'deleteAllIngredients')
      .mockRejectedValue(UnknownError);
    const createIngredientControllerMethod = jest.spyOn(ingredientController, 'createIngredient');
    const createIngredientServiceMethod = jest.spyOn(ingredientService, 'createIngredient');
    await expect(ingredientController.createIngredient(ingredient)).rejects.toThrow(
      new RpcException(new BadRequestException(messages.COMMON.COMMON_ERROR)),
    );
    expect(createIngredientControllerMethod).toHaveBeenCalledTimes(1);
    expect(createIngredientControllerMethod).toHaveBeenCalledWith(ingredient);
    expect(createIngredientServiceMethod).toHaveBeenCalledTimes(1);
    expect(createIngredientServiceMethod).toHaveBeenCalledWith(ingredient);
    expect(createIngredient).toHaveBeenCalledTimes(1);
    expect(createIngredient).toHaveBeenCalledWith({
      data: ingredient,
    });
    expect(deleteAllIngredients).toHaveBeenCalledTimes(1);
    expect(updateIngredientStateWhenExpired).not.toHaveBeenCalled();
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(UnknownError.message, expect.any(String));
  });

  it('create ingredient failed with updateIngredientStateWhenExpired method got unknown error', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const createIngredient = jest.spyOn(prismaService.ingredient, 'create').mockResolvedValue(ingredient);
    const updateIngredientStateWhenExpired = jest
      .spyOn(ingredientService as any, 'updateIngredientStateWhenExpired')
      .mockImplementation(() => {
        throw UnknownError;
      });
    const deleteAllIngredients = jest.spyOn(ingredientCachingService, 'deleteAllIngredients');
    const createIngredientControllerMethod = jest.spyOn(ingredientController, 'createIngredient');
    const createIngredientServiceMethod = jest.spyOn(ingredientService, 'createIngredient');
    await expect(ingredientController.createIngredient(ingredient)).rejects.toThrow(
      new RpcException(new BadRequestException(messages.COMMON.COMMON_ERROR)),
    );
    expect(createIngredientControllerMethod).toHaveBeenCalledTimes(1);
    expect(createIngredientControllerMethod).toHaveBeenCalledWith(ingredient);
    expect(createIngredientServiceMethod).toHaveBeenCalledTimes(1);
    expect(createIngredientServiceMethod).toHaveBeenCalledWith(ingredient);
    expect(createIngredient).toHaveBeenCalledTimes(1);
    expect(createIngredient).toHaveBeenCalledWith({
      data: ingredient,
    });
    expect(deleteAllIngredients).toHaveBeenCalledTimes(1);
    expect(updateIngredientStateWhenExpired).toHaveBeenCalledTimes(1);
    expect(updateIngredientStateWhenExpired).toHaveBeenLastCalledWith(ingredient, expect.any(String));
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(UnknownError.message, expect.any(String));
  });

  it('create ingredient failed with database disconnect error', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const createIngredient = jest.spyOn(prismaService.ingredient, 'create').mockRejectedValue(PrismaDisconnectError);
    const updateIngredientStateWhenExpired = jest.spyOn(ingredientService as any, 'updateIngredientStateWhenExpired');
    const deleteAllIngredients = jest.spyOn(ingredientCachingService, 'deleteAllIngredients');
    const createIngredientControllerMethod = jest.spyOn(ingredientController, 'createIngredient');
    const createIngredientServiceMethod = jest.spyOn(ingredientService, 'createIngredient');
    await expect(ingredientController.createIngredient(ingredient)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(PrismaDisconnectError.message))),
    );
    expect(createIngredientControllerMethod).toHaveBeenCalledTimes(1);
    expect(createIngredientControllerMethod).toHaveBeenCalledWith(ingredient);
    expect(createIngredientServiceMethod).toHaveBeenCalledTimes(1);
    expect(createIngredientServiceMethod).toHaveBeenCalledWith(ingredient);
    expect(createIngredient).toHaveBeenCalledTimes(1);
    expect(createIngredient).toHaveBeenCalledWith({
      data: ingredient,
    });
    expect(deleteAllIngredients).not.toHaveBeenCalled();
    expect(updateIngredientStateWhenExpired).not.toHaveBeenCalled();
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(PrismaDisconnectError.message, expect.any(String));
  });
});

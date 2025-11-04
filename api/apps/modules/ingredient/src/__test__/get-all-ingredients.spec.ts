import IngredientController from '../ingredient.controller';
import IngredientService from '../ingredient.service';
import LoggingService from '@share/libs/logging/logging.service';
import IngredientCachingService from '@share/libs/caching/ingredient/ingredient.service';
import { PrismaDisconnectError } from '@share/test/pre-setup/mock/errors/prisma-errors';
import startUp from './pre-setup';
import { createIngredients } from '@share/test/pre-setup/mock/data/ingredient';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import { RpcException } from '@nestjs/microservices';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { createMessage } from '@share/utils';
import messages from '@share/constants/messages';

let ingredientController: IngredientController;
let ingredientService: IngredientService;
let loggerService: LoggingService;
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
  ingredientController = moduleRef.get(IngredientController);
  loggerService = moduleRef.get(LoggingService);
  ingredientCachingService = moduleRef.get(IngredientCachingService);
});

describe('get all ingredients', () => {
  it('get all ingredients success with cache data', async () => {
    expect.hasAssertions();
    const redisGetAllIngredients = jest
      .spyOn(ingredientCachingService, 'getAllIngredients')
      .mockResolvedValue(ingredients);
    const checkExists = jest.spyOn(ingredientCachingService, 'checkExists').mockResolvedValue(true);
    const storeAllIngredients = jest.spyOn(ingredientService as any, 'storeCacheIngredients');
    const getAllIngredientsControllerMethod = jest.spyOn(ingredientController, 'getAllIngredients');
    const getAllIngredientsServiceMethod = jest.spyOn(ingredientService, 'getAll');
    await expect(ingredientController.getAllIngredients(select)).resolves.toEqual(ingredients);
    expect(getAllIngredientsControllerMethod).toHaveBeenCalledTimes(1);
    expect(getAllIngredientsControllerMethod).toHaveBeenCalledWith(select);
    expect(getAllIngredientsServiceMethod).toHaveBeenCalledTimes(1);
    expect(getAllIngredientsServiceMethod).toHaveBeenCalledWith(select);
    expect(checkExists).toHaveBeenCalledTimes(1);
    expect(storeAllIngredients).not.toHaveBeenCalled();
    expect(redisGetAllIngredients).toHaveBeenCalled();
  });

  it('get all ingredients success without cache data', async () => {
    expect.hasAssertions();
    const checkExists = jest.spyOn(ingredientCachingService, 'checkExists').mockResolvedValue(false);
    const redisGetAllIngredients = jest.spyOn(ingredientCachingService, 'getAllIngredients');
    const storeAllIngredients = jest
      .spyOn(ingredientService as any, 'storeCacheIngredients')
      .mockResolvedValue(ingredients);
    const getAllIngredientsControllerMethod = jest.spyOn(ingredientController, 'getAllIngredients');
    const getAllIngredientsServiceMethod = jest.spyOn(ingredientService, 'getAll');
    await expect(ingredientController.getAllIngredients(select)).resolves.toEqual(ingredients);
    expect(getAllIngredientsControllerMethod).toHaveBeenCalledTimes(1);
    expect(getAllIngredientsControllerMethod).toHaveBeenCalledWith(select);
    expect(getAllIngredientsServiceMethod).toHaveBeenCalledTimes(1);
    expect(getAllIngredientsServiceMethod).toHaveBeenCalledWith(select);
    expect(checkExists).toHaveBeenCalledTimes(1);
    expect(storeAllIngredients).toHaveBeenCalledTimes(1);
    expect(redisGetAllIngredients).not.toHaveBeenCalled();
  });

  it('get all ingredients failed with not found error', async () => {
    expect.hasAssertions();
    const getAllIngredientsControllerMethod = jest.spyOn(ingredientController, 'getAllIngredients');
    const getAllIngredientsServiceMethod = jest.spyOn(ingredientService, 'getAll').mockResolvedValue([]);
    await expect(ingredientController.getAllIngredients(select)).rejects.toThrow(
      new RpcException(new NotFoundException([])),
    );
    expect(getAllIngredientsControllerMethod).toHaveBeenCalledTimes(1);
    expect(getAllIngredientsControllerMethod).toHaveBeenCalledWith(select);
    expect(getAllIngredientsServiceMethod).toHaveBeenCalledTimes(1);
    expect(getAllIngredientsServiceMethod).toHaveBeenCalledWith(select);
  });

  it('get all ingredients failed with unknown error', async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(loggerService, 'error');
    const getAllIngredientsControllerMethod = jest.spyOn(ingredientController, 'getAllIngredients');
    const getAllIngredientsServiceMethod = jest.spyOn(ingredientService, 'getAll').mockRejectedValue(UnknownError);
    await expect(ingredientController.getAllIngredients(select)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(messages.COMMON.COMMON_ERROR))),
    );
    expect(getAllIngredientsControllerMethod).toHaveBeenCalledTimes(1);
    expect(getAllIngredientsControllerMethod).toHaveBeenCalledWith(select);
    expect(getAllIngredientsServiceMethod).toHaveBeenCalledTimes(1);
    expect(getAllIngredientsServiceMethod).toHaveBeenCalledWith(select);
    expect(logError).toHaveBeenCalledTimes(1);
    expect(logError).toHaveBeenLastCalledWith(UnknownError.message, expect.any(String));
  });

  it('get all ingredients failed with database disconnect error', async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(loggerService, 'error');
    const checkExists = jest.spyOn(ingredientCachingService, 'checkExists').mockResolvedValue(false);
    const storeAllIngredients = jest
      .spyOn(ingredientService as any, 'storeCacheIngredients')
      .mockRejectedValue(PrismaDisconnectError);
    const redisStoreAllIngredients = jest.spyOn(ingredientCachingService, 'storeAllIngredients');
    const getAllIngredientsControllerMethod = jest.spyOn(ingredientController, 'getAllIngredients');
    const getAllIngredientsServiceMethod = jest.spyOn(ingredientService, 'getAll');
    await expect(ingredientController.getAllIngredients(select)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(PrismaDisconnectError.message))),
    );
    expect(getAllIngredientsControllerMethod).toHaveBeenCalledTimes(1);
    expect(getAllIngredientsControllerMethod).toHaveBeenCalledWith(select);
    expect(getAllIngredientsServiceMethod).toHaveBeenCalledTimes(1);
    expect(getAllIngredientsServiceMethod).toHaveBeenCalledWith(select);
    expect(checkExists).toHaveBeenCalledTimes(1);
    expect(storeAllIngredients).toHaveBeenCalledTimes(1);
    expect(redisStoreAllIngredients).not.toHaveBeenCalled();
    expect(logError).toHaveBeenCalledTimes(1);
    expect(logError).toHaveBeenLastCalledWith(PrismaDisconnectError.message, expect.any(String));
  });
});

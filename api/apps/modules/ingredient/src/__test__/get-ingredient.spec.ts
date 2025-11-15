import { BadRequestException, NotFoundException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaClient } from 'generated/prisma';
import IngredientController from '../ingredient.controller';
import IngredientService from '../ingredient.service';
import LoggingService from '@share/libs/logging/logging.service';
import { PrismaDisconnectError, PrismaNotFoundError } from '@share/test/pre-setup/mock/errors/prisma-errors';
import startUp from './pre-setup';
import { ingredient } from '@share/test/pre-setup/mock/data/ingredient';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import { createMessage } from '@share/utils';
import { PRISMA_CLIENT } from '@share/di-token';
import messages from '@share/constants/messages';

let ingredientController: IngredientController;
let ingredientService: IngredientService;
let loggerService: LoggingService;
let prismaService: PrismaClient;

const select: any = {
  query: {
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
  },
  ingredientId: ingredient.ingredient_id,
};

beforeEach(async () => {
  const moduleRef = await startUp();
  ingredientService = moduleRef.get(IngredientService);
  ingredientController = moduleRef.get(IngredientController);
  loggerService = moduleRef.get(LoggingService);
  prismaService = moduleRef.get(PRISMA_CLIENT);
});

describe('get ingredient', () => {
  it('get ingredient success', async () => {
    expect.hasAssertions();
    const findUniqueOrThrow = jest.spyOn(prismaService.ingredient, 'findUniqueOrThrow').mockResolvedValue(ingredient);
    const getIngredientControllerMethod = jest.spyOn(ingredientController, 'getIngredient');
    const getIngredientServiceMethod = jest.spyOn(ingredientService, 'getIngredient');
    await expect(ingredientController.getIngredient(select)).resolves.toEqual(ingredient);
    expect(getIngredientControllerMethod).toHaveBeenCalledTimes(1);
    expect(getIngredientControllerMethod).toHaveBeenCalledWith(select);
    expect(getIngredientServiceMethod).toHaveBeenCalledTimes(1);
    expect(getIngredientServiceMethod).toHaveBeenCalledWith(select);
    expect(findUniqueOrThrow).toHaveBeenCalledTimes(1);
    expect(findUniqueOrThrow).toHaveBeenCalledWith({
      where: {
        ingredient_id: select.ingredientId,
      },
      select: select.query,
    });
  });

  it('get ingredient failed with not found error', async () => {
    expect.hasAssertions();
    const findUniqueOrThrow = jest
      .spyOn(prismaService.ingredient, 'findUniqueOrThrow')
      .mockRejectedValue(PrismaNotFoundError);
    const getIngredientControllerMethod = jest.spyOn(ingredientController, 'getIngredient');
    const getIngredientServiceMethod = jest.spyOn(ingredientService, 'getIngredient');
    await expect(ingredientController.getIngredient(select)).rejects.toThrow(
      new RpcException(new NotFoundException(messages.INGREDIENT.NOT_FOUND)),
    );
    expect(getIngredientControllerMethod).toHaveBeenCalledTimes(1);
    expect(getIngredientControllerMethod).toHaveBeenCalledWith(select);
    expect(getIngredientServiceMethod).toHaveBeenCalledTimes(1);
    expect(getIngredientServiceMethod).toHaveBeenCalledWith(select);
    expect(findUniqueOrThrow).toHaveBeenCalledTimes(1);
    expect(findUniqueOrThrow).toHaveBeenCalledWith({
      where: {
        ingredient_id: select.ingredientId,
      },
      select: select.query,
    });
  });

  it('get ingredient failed with unknown error', async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(loggerService, 'error');
    const findUniqueOrThrow = jest.spyOn(prismaService.ingredient, 'findUniqueOrThrow').mockRejectedValue(UnknownError);
    const getIngredientControllerMethod = jest.spyOn(ingredientController, 'getIngredient');
    const getIngredientServiceMethod = jest.spyOn(ingredientService, 'getIngredient');
    await expect(ingredientController.getIngredient(select)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(messages.COMMON.COMMON_ERROR))),
    );
    expect(getIngredientControllerMethod).toHaveBeenCalledTimes(1);
    expect(getIngredientControllerMethod).toHaveBeenCalledWith(select);
    expect(getIngredientServiceMethod).toHaveBeenCalledTimes(1);
    expect(getIngredientServiceMethod).toHaveBeenCalledWith(select);
    expect(findUniqueOrThrow).toHaveBeenCalledTimes(1);
    expect(findUniqueOrThrow).toHaveBeenCalledWith({
      where: {
        ingredient_id: select.ingredientId,
      },
      select: select.query,
    });
    expect(logError).toHaveBeenCalledTimes(1);
    expect(logError).toHaveBeenLastCalledWith(UnknownError.message, expect.any(String));
  });

  it('get ingredient failed with database disconnect error', async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(loggerService, 'error');
    const findUniqueOrThrow = jest
      .spyOn(prismaService.ingredient, 'findUniqueOrThrow')
      .mockRejectedValue(PrismaDisconnectError);
    const getIngredientControllerMethod = jest.spyOn(ingredientController, 'getIngredient');
    const getIngredientServiceMethod = jest.spyOn(ingredientService, 'getIngredient');
    await expect(ingredientController.getIngredient(select)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(PrismaDisconnectError.message))),
    );
    expect(getIngredientControllerMethod).toHaveBeenCalledTimes(1);
    expect(getIngredientControllerMethod).toHaveBeenCalledWith(select);
    expect(getIngredientServiceMethod).toHaveBeenCalledTimes(1);
    expect(getIngredientServiceMethod).toHaveBeenCalledWith(select);
    expect(findUniqueOrThrow).toHaveBeenCalledTimes(1);
    expect(findUniqueOrThrow).toHaveBeenCalledWith({
      where: {
        ingredient_id: select.ingredientId,
      },
      select: select.query,
    });
    expect(logError).toHaveBeenCalledTimes(1);
    expect(logError).toHaveBeenLastCalledWith(PrismaDisconnectError.message, expect.any(String));
  });
});

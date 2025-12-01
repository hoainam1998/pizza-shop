import { PrismaClient } from 'generated/prisma';
import IngredientController from '../ingredient.controller';
import IngredientService from '../ingredient.service';
import LoggingService from '@share/libs/logging/logging.service';
import IngredientCachingService from '@share/libs/caching/ingredient/ingredient.service';
import { PrismaDisconnectError, PrismaNotFoundError } from '@share/test/pre-setup/mock/errors/prisma-errors';
import { PRISMA_CLIENT } from '@share/di-token';
import startUp from './pre-setup';
import {
  createIngredients,
  createIngredientsJson,
  createProductIngredients,
  ingredient,
} from '@share/test/pre-setup/mock/data/ingredient';
import { ComputeProductPrice } from '@share/dto/validators/ingredient.dto';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import { RpcException } from '@nestjs/microservices';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { createMessage } from '@share/utils';
import messages from '@share/constants/messages';

let ingredientController: IngredientController;
let ingredientService: IngredientService;
let prismaService: PrismaClient;
let loggerService: LoggingService;
let ingredientCachingService: IngredientCachingService;
const length = 2;

beforeEach(async () => {
  const moduleRef = await startUp();

  ingredientService = moduleRef.get(IngredientService);
  ingredientController = moduleRef.get(IngredientController);
  loggerService = moduleRef.get(LoggingService);
  prismaService = moduleRef.get(PRISMA_CLIENT);
  ingredientCachingService = moduleRef.get(IngredientCachingService);
});

describe('compute product price', () => {
  it('calculator product price success without missing list', async () => {
    expect.hasAssertions();
    const productId = Date.now().toString();
    const ingredientsJson = createIngredientsJson(length);
    const productIngredients = createProductIngredients(length);
    const controllerParam: ComputeProductPrice = {
      temporaryProductId: productId,
      productIngredients: productIngredients,
    };
    const ingredientIds = productIngredients.map((ingredient) => ingredient.ingredientId);
    const computeProductPriceControllerMethod = jest.spyOn(ingredientController, 'computeProductPrice');
    const computeProductPriceServiceMethod = jest.spyOn(ingredientService, 'computeProductIngredients');
    const getProductIngredientsStored = jest
      .spyOn(ingredientCachingService, 'getProductIngredientsStored')
      .mockResolvedValue(ingredientsJson);
    await expect(ingredientController.computeProductPrice(controllerParam)).resolves.toEqual(expect.any(Number));
    expect(computeProductPriceControllerMethod).toHaveBeenCalledTimes(1);
    expect(computeProductPriceControllerMethod).toHaveBeenCalledWith(controllerParam);
    expect(computeProductPriceServiceMethod).toHaveBeenCalledTimes(1);
    expect(computeProductPriceServiceMethod).toHaveBeenCalledWith(productId, productIngredients);
    expect(getProductIngredientsStored).toHaveBeenCalledTimes(1);
    expect(getProductIngredientsStored).toHaveBeenCalledWith(productId, ingredientIds);
  });

  it('calculator product price success with missing list', async () => {
    expect.hasAssertions();
    const productId = Date.now().toString();
    const ingredientsJson = createIngredientsJson(1);
    const productIngredients = createProductIngredients(length);
    const ingredients: any = createIngredients(length);
    const controllerParam: ComputeProductPrice = {
      temporaryProductId: productId,
      productIngredients: productIngredients,
    };
    const ingredientIds = productIngredients.map((ingredient) => ingredient.ingredientId);
    const storeProductIngredients = jest
      .spyOn(ingredientCachingService, 'storeProductIngredients')
      .mockResolvedValue(1);
    const findManyPrismaMethod = jest.spyOn(prismaService.ingredient, 'findMany').mockResolvedValue(ingredients);
    const computeProductPriceControllerMethod = jest.spyOn(ingredientController, 'computeProductPrice');
    const computeProductPriceServiceMethod = jest.spyOn(ingredientService, 'computeProductIngredients');
    const getProductIngredientsStored = jest
      .spyOn(ingredientCachingService, 'getProductIngredientsStored')
      .mockResolvedValue([...ingredientsJson, null]);
    await expect(ingredientController.computeProductPrice(controllerParam)).resolves.toEqual(expect.any(Number));
    expect(computeProductPriceControllerMethod).toHaveBeenCalledTimes(1);
    expect(computeProductPriceControllerMethod).toHaveBeenCalledWith(controllerParam);
    expect(computeProductPriceServiceMethod).toHaveBeenCalledTimes(1);
    expect(computeProductPriceServiceMethod).toHaveBeenCalledWith(productId, productIngredients);
    expect(getProductIngredientsStored).toHaveBeenCalledTimes(1);
    expect(getProductIngredientsStored).toHaveBeenCalledWith(productId, ingredientIds);
    expect(findManyPrismaMethod).toHaveBeenCalledTimes(1);
    expect(findManyPrismaMethod).toHaveBeenCalledWith({
      where: {
        ingredient_id: {
          in: expect.any(Array),
        },
      },
      select: {
        name: true,
        ingredient_id: true,
        price: true,
        unit: true,
      },
    });
    expect(storeProductIngredients).toHaveBeenCalledTimes(1);
    expect(storeProductIngredients).toHaveBeenCalledWith(productId, expect.any(Object));
  });

  it('calculator product price failed with unknown error', async () => {
    expect.hasAssertions();
    const productId = Date.now().toString();
    const productIngredients = createProductIngredients(length);
    const ingredients: any = createIngredients(length);
    const controllerParam: ComputeProductPrice = {
      temporaryProductId: productId,
      productIngredients: productIngredients,
    };
    const ingredientIds = productIngredients.map((ingredient) => ingredient.ingredientId);
    const storeProductIngredients = jest
      .spyOn(ingredientCachingService, 'storeProductIngredients')
      .mockResolvedValue(1);
    const logMethod = jest.spyOn(loggerService, 'error');
    const findManyPrismaMethod = jest.spyOn(prismaService.ingredient, 'findMany').mockResolvedValue(ingredients);
    const computeProductPriceControllerMethod = jest.spyOn(ingredientController, 'computeProductPrice');
    const computeProductPriceServiceMethod = jest.spyOn(ingredientService, 'computeProductIngredients');
    const getProductIngredientsStored = jest
      .spyOn(ingredientCachingService, 'getProductIngredientsStored')
      .mockRejectedValue(UnknownError);
    await expect(ingredientController.computeProductPrice(controllerParam)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(messages.COMMON.COMMON_ERROR))),
    );
    expect(computeProductPriceControllerMethod).toHaveBeenCalledTimes(1);
    expect(computeProductPriceControllerMethod).toHaveBeenCalledWith(controllerParam);
    expect(computeProductPriceServiceMethod).toHaveBeenCalledTimes(1);
    expect(computeProductPriceServiceMethod).toHaveBeenCalledWith(productId, productIngredients);
    expect(getProductIngredientsStored).toHaveBeenCalledTimes(1);
    expect(getProductIngredientsStored).toHaveBeenCalledWith(productId, ingredientIds);
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(UnknownError.message, expect.any(String));
    expect(findManyPrismaMethod).not.toHaveBeenCalled();
    expect(storeProductIngredients).not.toHaveBeenCalled();
  });

  it('calculator product price failed with prisma findMany got unknown error', async () => {
    expect.hasAssertions();
    const productId = Date.now().toString();
    const ingredientsJson = createIngredientsJson(1);
    const productIngredients = createProductIngredients(length);
    const controllerParam: ComputeProductPrice = {
      temporaryProductId: productId,
      productIngredients: productIngredients,
    };
    const ingredientIds = productIngredients.map((ingredient) => ingredient.ingredientId);
    const storeProductIngredients = jest
      .spyOn(ingredientCachingService, 'storeProductIngredients')
      .mockResolvedValue(1);
    const logMethod = jest.spyOn(loggerService, 'error');
    const findManyPrismaMethod = jest.spyOn(prismaService.ingredient, 'findMany').mockRejectedValue(UnknownError);
    const computeProductPriceControllerMethod = jest.spyOn(ingredientController, 'computeProductPrice');
    const computeProductPriceServiceMethod = jest.spyOn(ingredientService, 'computeProductIngredients');
    const getProductIngredientsStored = jest
      .spyOn(ingredientCachingService, 'getProductIngredientsStored')
      .mockResolvedValue([...ingredientsJson, null]);
    await expect(ingredientController.computeProductPrice(controllerParam)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(messages.COMMON.COMMON_ERROR))),
    );
    expect(computeProductPriceControllerMethod).toHaveBeenCalledTimes(1);
    expect(computeProductPriceControllerMethod).toHaveBeenCalledWith(controllerParam);
    expect(computeProductPriceServiceMethod).toHaveBeenCalledTimes(1);
    expect(computeProductPriceServiceMethod).toHaveBeenCalledWith(productId, productIngredients);
    expect(getProductIngredientsStored).toHaveBeenCalledTimes(1);
    expect(getProductIngredientsStored).toHaveBeenCalledWith(productId, ingredientIds);
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(UnknownError.message, expect.any(String));
    expect(findManyPrismaMethod).toHaveBeenCalledTimes(1);
    expect(findManyPrismaMethod).toHaveBeenCalledWith({
      where: {
        ingredient_id: {
          in: expect.any(Array),
        },
      },
      select: {
        name: true,
        ingredient_id: true,
        price: true,
        unit: true,
      },
    });
    expect(storeProductIngredients).not.toHaveBeenCalled();
  });

  it('calculator product price failed with prisma findMany got not found error', async () => {
    expect.hasAssertions();
    const productId = Date.now().toString();
    const ingredientsJson = createIngredientsJson(1);
    const productIngredients = createProductIngredients(length);
    const controllerParam: ComputeProductPrice = {
      temporaryProductId: productId,
      productIngredients: productIngredients,
    };
    const ingredientIds = productIngredients.map((ingredient) => ingredient.ingredientId);
    const storeProductIngredients = jest
      .spyOn(ingredientCachingService, 'storeProductIngredients')
      .mockResolvedValue(1);
    const logMethod = jest.spyOn(loggerService, 'error');
    const findManyPrismaMethod = jest
      .spyOn(prismaService.ingredient, 'findMany')
      .mockRejectedValue(PrismaNotFoundError);
    const computeProductPriceControllerMethod = jest.spyOn(ingredientController, 'computeProductPrice');
    const computeProductPriceServiceMethod = jest.spyOn(ingredientService, 'computeProductIngredients');
    const getProductIngredientsStored = jest
      .spyOn(ingredientCachingService, 'getProductIngredientsStored')
      .mockResolvedValue([...ingredientsJson, null]);
    await expect(ingredientController.computeProductPrice(controllerParam)).rejects.toThrow(
      new RpcException(new NotFoundException(messages.INGREDIENT.NOT_FOUND)),
    );
    expect(computeProductPriceControllerMethod).toHaveBeenCalledTimes(1);
    expect(computeProductPriceControllerMethod).toHaveBeenCalledWith(controllerParam);
    expect(computeProductPriceServiceMethod).toHaveBeenCalledTimes(1);
    expect(computeProductPriceServiceMethod).toHaveBeenCalledWith(productId, productIngredients);
    expect(getProductIngredientsStored).toHaveBeenCalledTimes(1);
    expect(getProductIngredientsStored).toHaveBeenCalledWith(productId, ingredientIds);
    expect(logMethod).not.toHaveBeenCalled();
    expect(findManyPrismaMethod).toHaveBeenCalledTimes(1);
    expect(findManyPrismaMethod).toHaveBeenCalledWith({
      where: {
        ingredient_id: {
          in: expect.any(Array),
        },
      },
      select: {
        name: true,
        ingredient_id: true,
        price: true,
        unit: true,
      },
    });
    expect(storeProductIngredients).not.toHaveBeenCalled();
  });

  it('calculator product price failed with prisma findMany got database disconnect error', async () => {
    expect.hasAssertions();
    const productId = Date.now().toString();
    const ingredientsJson = createIngredientsJson(1);
    const productIngredients = createProductIngredients(length);
    const controllerParam: ComputeProductPrice = {
      temporaryProductId: productId,
      productIngredients: productIngredients,
    };
    const ingredientIds = productIngredients.map((ingredient) => ingredient.ingredientId);
    const storeProductIngredients = jest
      .spyOn(ingredientCachingService, 'storeProductIngredients')
      .mockResolvedValue(1);
    const logMethod = jest.spyOn(loggerService, 'error');
    const findManyPrismaMethod = jest
      .spyOn(prismaService.ingredient, 'findMany')
      .mockRejectedValue(PrismaDisconnectError);
    const computeProductPriceControllerMethod = jest.spyOn(ingredientController, 'computeProductPrice');
    const computeProductPriceServiceMethod = jest.spyOn(ingredientService, 'computeProductIngredients');
    const getProductIngredientsStored = jest
      .spyOn(ingredientCachingService, 'getProductIngredientsStored')
      .mockResolvedValue([...ingredientsJson, null]);
    await expect(ingredientController.computeProductPrice(controllerParam)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(PrismaDisconnectError.message))),
    );
    expect(computeProductPriceControllerMethod).toHaveBeenCalledTimes(1);
    expect(computeProductPriceControllerMethod).toHaveBeenCalledWith(controllerParam);
    expect(computeProductPriceServiceMethod).toHaveBeenCalledTimes(1);
    expect(computeProductPriceServiceMethod).toHaveBeenCalledWith(productId, productIngredients);
    expect(getProductIngredientsStored).toHaveBeenCalledTimes(1);
    expect(getProductIngredientsStored).toHaveBeenCalledWith(productId, ingredientIds);
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(PrismaDisconnectError.message, expect.any(String));
    expect(findManyPrismaMethod).toHaveBeenCalledTimes(1);
    expect(findManyPrismaMethod).toHaveBeenCalledWith({
      where: {
        ingredient_id: {
          in: expect.any(Array),
        },
      },
      select: {
        name: true,
        ingredient_id: true,
        price: true,
        unit: true,
      },
    });
    expect(storeProductIngredients).not.toHaveBeenCalled();
  });

  it('calculator product price failed with wrong unit', async () => {
    expect.hasAssertions();
    const errorMessage = `${ingredient.name} have wrong unit!`;
    const productId = Date.now().toString();
    const productIngredients = createProductIngredients(length);
    const ingredients: any = createIngredients(length);
    const controllerParam: ComputeProductPrice = {
      temporaryProductId: productId,
      productIngredients: productIngredients,
    };
    const storeProductIngredients = jest
      .spyOn(ingredientCachingService, 'storeProductIngredients')
      .mockResolvedValue(1);
    const logMethod = jest.spyOn(loggerService, 'error');
    const findManyPrismaMethod = jest.spyOn(prismaService.ingredient, 'findMany').mockResolvedValue(ingredients);
    const computeProductPriceControllerMethod = jest.spyOn(ingredientController, 'computeProductPrice');
    const computeProductPriceServiceMethod = jest
      .spyOn(ingredientService, 'computeProductIngredients')
      .mockRejectedValue(new RpcException(new BadRequestException(errorMessage)));
    const getProductIngredientsStored = jest
      .spyOn(ingredientCachingService, 'getProductIngredientsStored')
      .mockRejectedValue(UnknownError);
    await expect(ingredientController.computeProductPrice(controllerParam)).rejects.toThrow(
      new RpcException(new BadRequestException(errorMessage)),
    );
    expect(computeProductPriceControllerMethod).toHaveBeenCalledTimes(1);
    expect(computeProductPriceControllerMethod).toHaveBeenCalledWith(controllerParam);
    expect(computeProductPriceServiceMethod).toHaveBeenCalledTimes(1);
    expect(computeProductPriceServiceMethod).toHaveBeenCalledWith(productId, productIngredients);
    expect(getProductIngredientsStored).not.toHaveBeenCalled();
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(errorMessage, expect.any(String));
    expect(findManyPrismaMethod).not.toHaveBeenCalled();
    expect(storeProductIngredients).not.toHaveBeenCalled();
  });
});

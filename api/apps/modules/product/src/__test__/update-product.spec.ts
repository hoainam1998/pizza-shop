import { PrismaClient } from 'generated/prisma';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import { PrismaDisconnectError, PrismaNotFoundError } from '@share/test/pre-setup/mock/errors/prisma-errors';
import { RpcException } from '@nestjs/microservices';
import startUp from './pre-setup';
import IngredientCachingService from '@share/libs/caching/ingredient/ingredient.service';
import ProductController from '../product.controller';
import ProductService from '../product.service';
import { product } from '@share/test/pre-setup/mock/data/product';
import { PRISMA_CLIENT } from '@share/di-token';
import LoggingService from '@share/libs/logging/logging.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { createMessage } from '@share/utils';
import messages from '@share/constants/messages';

let productController: ProductController;
let productService: ProductService;
let prismaService: PrismaClient;
let loggerService: LoggingService;
let ingredientCachingService: IngredientCachingService;

beforeEach(async () => {
  const moduleRef = await startUp();

  productService = moduleRef.get(ProductService);
  productController = moduleRef.get(ProductController);
  loggerService = moduleRef.get(LoggingService);
  prismaService = moduleRef.get(PRISMA_CLIENT);
  ingredientCachingService = moduleRef.get(IngredientCachingService);
});

afterEach((done) => {
  jest.restoreAllMocks();
  jest.resetAllMocks();
  done();
});

describe('update product', () => {
  it('update product was success', async () => {
    expect.hasAssertions();
    const deleteAllProductIngredients = jest
      .spyOn(ingredientCachingService, 'deleteAllProductIngredients')
      .mockResolvedValue(1);
    const deleteProductWhenExpired = jest.spyOn(productService as any, 'deleteProductWhenExpired');
    const deleteIngredientPrismaMethod = jest.spyOn(prismaService.product_ingredient, 'deleteMany');
    const updatePrismaMethod = jest.spyOn(prismaService.product, 'update');
    const transactionPrismaMethod = jest
      .spyOn(prismaService, '$transaction')
      .mockResolvedValue([product.product_ingredient, product]);
    const updateMethodService = jest.spyOn(productService, 'updateProduct');
    const updateMethodController = jest.spyOn(productController, 'updateProduct');
    await expect(productController.updateProduct(product)).resolves.toBe(product);
    expect(updateMethodController).toHaveBeenCalledTimes(1);
    expect(updateMethodController).toHaveBeenCalledWith(product);
    expect(updateMethodService).toHaveBeenCalledTimes(1);
    expect(updateMethodService).toHaveBeenCalledWith(product);
    expect(transactionPrismaMethod).toHaveBeenCalledTimes(1);
    expect(deleteProductWhenExpired).toHaveBeenCalledTimes(1);
    expect(deleteProductWhenExpired).toHaveBeenCalledWith(product, productService.updateProduct.name);
    expect(deleteIngredientPrismaMethod).toHaveBeenCalledTimes(1);
    expect(deleteIngredientPrismaMethod).toHaveBeenCalledWith({
      where: {
        product_id: product.product_id,
      },
    });
    expect(updatePrismaMethod).toHaveBeenCalledTimes(1);
    expect(updatePrismaMethod).toHaveBeenCalledWith({
      where: {
        product_id: product.product_id,
      },
      data: {
        name: product.name,
        avatar: product.avatar,
        count: product.count,
        price: product.price,
        original_price: product.price,
        expired_time: product.expired_time,
        category_id: product.category_id,
        product_ingredient: product.product_ingredient,
      },
    });
    expect(deleteAllProductIngredients).toHaveBeenCalledTimes(1);
    expect(deleteAllProductIngredients).toHaveBeenCalledWith(product.product_id);
  });

  it('update product failed with not found error', async () => {
    expect.hasAssertions();
    const deleteAllProductIngredients = jest.spyOn(ingredientCachingService, 'deleteAllProductIngredients');
    const deleteProductWhenExpired = jest.spyOn(productService as any, 'deleteProductWhenExpired');
    const deleteIngredientPrismaMethod = jest.spyOn(prismaService.product_ingredient, 'deleteMany');
    const updatePrismaMethod = jest.spyOn(prismaService.product, 'update');
    const transactionPrismaMethod = jest.spyOn(prismaService, '$transaction').mockRejectedValue(PrismaNotFoundError);
    const updateMethodService = jest.spyOn(productService, 'updateProduct');
    const updateMethodController = jest.spyOn(productController, 'updateProduct');
    await expect(productController.updateProduct(product)).rejects.toThrow(
      new RpcException(new NotFoundException(messages.PRODUCT.NOT_FOUND)),
    );
    expect(updateMethodController).toHaveBeenCalledTimes(1);
    expect(updateMethodController).toHaveBeenCalledWith(product);
    expect(updateMethodService).toHaveBeenCalledTimes(1);
    expect(updateMethodService).toHaveBeenCalledWith(product);
    expect(transactionPrismaMethod).toHaveBeenCalledTimes(1);
    expect(deleteIngredientPrismaMethod).toHaveBeenCalledTimes(1);
    expect(deleteIngredientPrismaMethod).toHaveBeenCalledWith({
      where: {
        product_id: product.product_id,
      },
    });
    expect(updatePrismaMethod).toHaveBeenCalledTimes(1);
    expect(updatePrismaMethod).toHaveBeenCalledWith({
      where: {
        product_id: product.product_id,
      },
      data: {
        name: product.name,
        avatar: product.avatar,
        count: product.count,
        price: product.price,
        original_price: product.price,
        expired_time: product.expired_time,
        category_id: product.category_id,
        product_ingredient: product.product_ingredient,
      },
    });
    expect(deleteProductWhenExpired).not.toHaveBeenCalled();
    expect(deleteAllProductIngredients).not.toHaveBeenCalled();
  });

  it('update product failed with unknown error', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'log');
    const deleteAllProductIngredients = jest.spyOn(ingredientCachingService, 'deleteAllProductIngredients');
    const deleteProductWhenExpired = jest.spyOn(productService as any, 'deleteProductWhenExpired');
    const deleteIngredientPrismaMethod = jest.spyOn(prismaService.product_ingredient, 'deleteMany');
    const updatePrismaMethod = jest.spyOn(prismaService.product, 'update');
    const transactionPrismaMethod = jest.spyOn(prismaService, '$transaction').mockRejectedValue(UnknownError);
    const updateMethodService = jest.spyOn(productService, 'updateProduct');
    const updateMethodController = jest.spyOn(productController, 'updateProduct');
    await expect(productController.updateProduct(product)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(messages.COMMON.COMMON_ERROR))),
    );
    expect(updateMethodController).toHaveBeenCalledTimes(1);
    expect(updateMethodController).toHaveBeenCalledWith(product);
    expect(updateMethodService).toHaveBeenCalledTimes(1);
    expect(updateMethodService).toHaveBeenCalledWith(product);
    expect(transactionPrismaMethod).toHaveBeenCalledTimes(1);
    expect(deleteIngredientPrismaMethod).toHaveBeenCalledTimes(1);
    expect(deleteIngredientPrismaMethod).toHaveBeenCalledWith({
      where: {
        product_id: product.product_id,
      },
    });
    expect(updatePrismaMethod).toHaveBeenCalledTimes(1);
    expect(updatePrismaMethod).toHaveBeenCalledWith({
      where: {
        product_id: product.product_id,
      },
      data: {
        name: product.name,
        avatar: product.avatar,
        count: product.count,
        price: product.price,
        original_price: product.price,
        expired_time: product.expired_time,
        category_id: product.category_id,
        product_ingredient: product.product_ingredient,
      },
    });
    expect(deleteProductWhenExpired).not.toHaveBeenCalled();
    expect(logMethod).toHaveBeenCalled();
    expect(logMethod).toHaveBeenCalledWith(UnknownError.message, expect.any(String));
    expect(deleteAllProductIngredients).not.toHaveBeenCalled();
  });

  it('update product failed with database disconnect error', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'log');
    const deleteAllProductIngredients = jest.spyOn(ingredientCachingService, 'deleteAllProductIngredients');
    const deleteProductWhenExpired = jest.spyOn(productService as any, 'deleteProductWhenExpired');
    const deleteIngredientPrismaMethod = jest.spyOn(prismaService.product_ingredient, 'deleteMany');
    const updatePrismaMethod = jest.spyOn(prismaService.product, 'update');
    const transactionPrismaMethod = jest.spyOn(prismaService, '$transaction').mockRejectedValue(PrismaDisconnectError);
    const updateMethodService = jest.spyOn(productService, 'updateProduct');
    const updateMethodController = jest.spyOn(productController, 'updateProduct');
    await expect(productController.updateProduct(product)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(PrismaDisconnectError.message))),
    );
    expect(updateMethodController).toHaveBeenCalledTimes(1);
    expect(updateMethodController).toHaveBeenCalledWith(product);
    expect(updateMethodService).toHaveBeenCalledTimes(1);
    expect(updateMethodService).toHaveBeenCalledWith(product);
    expect(transactionPrismaMethod).toHaveBeenCalledTimes(1);
    expect(deleteIngredientPrismaMethod).toHaveBeenCalledTimes(1);
    expect(deleteIngredientPrismaMethod).toHaveBeenCalledWith({
      where: {
        product_id: product.product_id,
      },
    });
    expect(updatePrismaMethod).toHaveBeenCalledTimes(1);
    expect(updatePrismaMethod).toHaveBeenCalledWith({
      where: {
        product_id: product.product_id,
      },
      data: {
        name: product.name,
        avatar: product.avatar,
        count: product.count,
        price: product.price,
        original_price: product.price,
        expired_time: product.expired_time,
        category_id: product.category_id,
        product_ingredient: product.product_ingredient,
      },
    });
    expect(deleteProductWhenExpired).not.toHaveBeenCalled();
    expect(deleteAllProductIngredients).not.toHaveBeenCalled();
    expect(logMethod).toHaveBeenCalled();
    expect(logMethod).toHaveBeenCalledWith(PrismaDisconnectError.message, expect.any(String));
  });
});

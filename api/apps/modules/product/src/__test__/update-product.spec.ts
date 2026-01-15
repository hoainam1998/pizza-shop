import { PrismaClient } from 'generated/prisma';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import { PrismaDisconnectError, PrismaNotFoundError } from '@share/test/pre-setup/mock/errors/prisma-errors';
import { RpcException } from '@nestjs/microservices';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import startUp from './pre-setup';
import ProductController from '../product.controller';
import ProductService from '../product.service';
import { product } from '@share/test/pre-setup/mock/data/product';
import { user } from '@share/test/pre-setup/mock/data/user';
import { PRISMA_CLIENT } from '@share/di-token';
import LoggingService from '@share/libs/logging/logging.service';
import { createMessage } from '@share/utils';
import messages from '@share/constants/messages';
import ProductCachingService from '@share/libs/caching/product/product.service';
import IngredientCachingService from '@share/libs/caching/ingredient/ingredient.service';

const userIds = [user.user_id];
let productController: ProductController;
let productService: ProductService;
let prismaService: PrismaClient;
let loggerService: LoggingService;
let ingredientCachingService: IngredientCachingService;
let productCachingService: ProductCachingService;

beforeEach(async () => {
  const moduleRef = await startUp();

  productService = moduleRef.get(ProductService);
  productController = moduleRef.get(ProductController);
  loggerService = moduleRef.get(LoggingService);
  prismaService = moduleRef.get(PRISMA_CLIENT);
  ingredientCachingService = moduleRef.get(IngredientCachingService);
  productCachingService = moduleRef.get(ProductCachingService);
});

describe('update product', () => {
  it('update product was success', async () => {
    expect.hasAssertions();
    const deleteAllProductIngredients = jest
      .spyOn(ingredientCachingService, 'deleteAllProductIngredients')
      .mockResolvedValue(1);
    const getVisitor = jest.spyOn(productCachingService, 'getVisitor').mockResolvedValue(userIds);
    const updateProductStateWhenExpired = jest.spyOn(productService as any, 'updateProductStateWhenExpired');
    const deleteIngredientPrismaMethod = jest
      .spyOn(prismaService.product_ingredient, 'deleteMany')
      .mockResolvedValue(product.product_ingredient);
    const updatePrismaMethod = jest.spyOn(prismaService.product, 'update').mockResolvedValue(product);
    const updateMethodService = jest.spyOn(productService, 'updateProduct');
    const updateMethodController = jest.spyOn(productController, 'updateProduct');
    await expect(productController.updateProduct(product)).resolves.toBe(userIds);
    expect(updateMethodController).toHaveBeenCalledTimes(1);
    expect(updateMethodController).toHaveBeenCalledWith(product);
    expect(updateMethodService).toHaveBeenCalledTimes(1);
    expect(updateMethodService).toHaveBeenCalledWith(product);
    expect(updateProductStateWhenExpired).toHaveBeenCalledTimes(1);
    expect(updateProductStateWhenExpired).toHaveBeenCalledWith(product, productService.updateProduct.name);
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
    expect(getVisitor).toHaveBeenCalledTimes(1);
    expect(getVisitor).toHaveBeenCalledWith(product.product_id);
  });

  it('update product failed with deleteIngredient got not found error', async () => {
    expect.hasAssertions();
    const getVisitor = jest.spyOn(productCachingService, 'getVisitor');
    const deleteAllProductIngredients = jest.spyOn(ingredientCachingService, 'deleteAllProductIngredients');
    const updateProductStateWhenExpired = jest.spyOn(productService as any, 'updateProductStateWhenExpired');
    const deleteIngredientPrismaMethod = jest
      .spyOn(prismaService.product_ingredient, 'deleteMany')
      .mockRejectedValue(PrismaNotFoundError);
    const updatePrismaMethod = jest.spyOn(prismaService.product, 'update').mockResolvedValue(product);
    const updateMethodService = jest.spyOn(productService, 'updateProduct');
    const updateMethodController = jest.spyOn(productController, 'updateProduct');
    await expect(productController.updateProduct(product)).rejects.toThrow(
      new RpcException(new NotFoundException(messages.PRODUCT.NOT_FOUND)),
    );
    expect(updateMethodController).toHaveBeenCalledTimes(1);
    expect(updateMethodController).toHaveBeenCalledWith(product);
    expect(updateMethodService).toHaveBeenCalledTimes(1);
    expect(updateMethodService).toHaveBeenCalledWith(product);
    expect(deleteIngredientPrismaMethod).toHaveBeenCalledTimes(1);
    expect(deleteIngredientPrismaMethod).toHaveBeenCalledWith({
      where: {
        product_id: product.product_id,
      },
    });
    expect(updatePrismaMethod).not.toHaveBeenCalled();
    expect(updateProductStateWhenExpired).not.toHaveBeenCalled();
    expect(deleteAllProductIngredients).not.toHaveBeenCalled();
    expect(getVisitor).not.toHaveBeenCalled();
  });

  it('update product failed with updateMethod got not found error', async () => {
    expect.hasAssertions();
    const getVisitor = jest.spyOn(productCachingService, 'getVisitor');
    const deleteAllProductIngredients = jest.spyOn(ingredientCachingService, 'deleteAllProductIngredients');
    const updateProductStateWhenExpired = jest.spyOn(productService as any, 'updateProductStateWhenExpired');
    const deleteIngredientPrismaMethod = jest
      .spyOn(prismaService.product_ingredient, 'deleteMany')
      .mockResolvedValue(product);
    const updatePrismaMethod = jest.spyOn(prismaService.product, 'update').mockRejectedValue(PrismaNotFoundError);
    const updateMethodService = jest.spyOn(productService, 'updateProduct');
    const updateMethodController = jest.spyOn(productController, 'updateProduct');
    await expect(productController.updateProduct(product)).rejects.toThrow(
      new RpcException(new NotFoundException(messages.PRODUCT.NOT_FOUND)),
    );
    expect(updateMethodController).toHaveBeenCalledTimes(1);
    expect(updateMethodController).toHaveBeenCalledWith(product);
    expect(updateMethodService).toHaveBeenCalledTimes(1);
    expect(updateMethodService).toHaveBeenCalledWith(product);
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
    expect(updateProductStateWhenExpired).not.toHaveBeenCalled();
    expect(deleteAllProductIngredients).not.toHaveBeenCalled();
    expect(getVisitor).not.toHaveBeenCalled();
  });

  it('update product failed with deleteIngredient got unknown error', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const deleteAllProductIngredients = jest.spyOn(ingredientCachingService, 'deleteAllProductIngredients');
    const getVisitor = jest.spyOn(productCachingService, 'getVisitor');
    const updateProductStateWhenExpired = jest.spyOn(productService as any, 'updateProductStateWhenExpired');
    const deleteIngredientPrismaMethod = jest
      .spyOn(prismaService.product_ingredient, 'deleteMany')
      .mockRejectedValue(UnknownError);
    const updatePrismaMethod = jest.spyOn(prismaService.product, 'update');
    const updateMethodService = jest.spyOn(productService, 'updateProduct');
    const updateMethodController = jest.spyOn(productController, 'updateProduct');
    await expect(productController.updateProduct(product)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(messages.COMMON.COMMON_ERROR))),
    );
    expect(updateMethodController).toHaveBeenCalledTimes(1);
    expect(updateMethodController).toHaveBeenCalledWith(product);
    expect(updateMethodService).toHaveBeenCalledTimes(1);
    expect(updateMethodService).toHaveBeenCalledWith(product);
    expect(deleteIngredientPrismaMethod).toHaveBeenCalledTimes(1);
    expect(deleteIngredientPrismaMethod).toHaveBeenCalledWith({
      where: {
        product_id: product.product_id,
      },
    });
    expect(updatePrismaMethod).not.toHaveBeenCalled();
    expect(updateProductStateWhenExpired).not.toHaveBeenCalled();
    expect(logMethod).toHaveBeenCalled();
    expect(logMethod).toHaveBeenCalledWith(UnknownError.message, expect.any(String));
    expect(deleteAllProductIngredients).not.toHaveBeenCalled();
    expect(getVisitor).not.toHaveBeenCalled();
  });

  it('update product failed with update got unknown error', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const deleteAllProductIngredients = jest.spyOn(ingredientCachingService, 'deleteAllProductIngredients');
    const getVisitor = jest.spyOn(productCachingService, 'getVisitor');
    const updateProductStateWhenExpired = jest.spyOn(productService as any, 'updateProductStateWhenExpired');
    const deleteIngredientPrismaMethod = jest
      .spyOn(prismaService.product_ingredient, 'deleteMany')
      .mockResolvedValue(product.product_ingredient);
    const updatePrismaMethod = jest.spyOn(prismaService.product, 'update').mockRejectedValue(UnknownError);
    const updateMethodService = jest.spyOn(productService, 'updateProduct');
    const updateMethodController = jest.spyOn(productController, 'updateProduct');
    await expect(productController.updateProduct(product)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(messages.COMMON.COMMON_ERROR))),
    );
    expect(updateMethodController).toHaveBeenCalledTimes(1);
    expect(updateMethodController).toHaveBeenCalledWith(product);
    expect(updateMethodService).toHaveBeenCalledTimes(1);
    expect(updateMethodService).toHaveBeenCalledWith(product);
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
    expect(updateProductStateWhenExpired).not.toHaveBeenCalled();
    expect(logMethod).toHaveBeenCalled();
    expect(logMethod).toHaveBeenCalledWith(UnknownError.message, expect.any(String));
    expect(deleteAllProductIngredients).not.toHaveBeenCalled();
    expect(getVisitor).not.toHaveBeenCalled();
  });

  it('update product failed with database disconnect error', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const deleteAllProductIngredients = jest.spyOn(ingredientCachingService, 'deleteAllProductIngredients');
    const getVisitor = jest.spyOn(productCachingService, 'getVisitor');
    const updateProductStateWhenExpired = jest.spyOn(productService as any, 'updateProductStateWhenExpired');
    const deleteIngredientPrismaMethod = jest
      .spyOn(prismaService.product_ingredient, 'deleteMany')
      .mockRejectedValue(PrismaDisconnectError);
    const updatePrismaMethod = jest.spyOn(prismaService.product, 'update');
    const updateMethodService = jest.spyOn(productService, 'updateProduct');
    const updateMethodController = jest.spyOn(productController, 'updateProduct');
    await expect(productController.updateProduct(product)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(PrismaDisconnectError.message))),
    );
    expect(updateMethodController).toHaveBeenCalledTimes(1);
    expect(updateMethodController).toHaveBeenCalledWith(product);
    expect(updateMethodService).toHaveBeenCalledTimes(1);
    expect(updateMethodService).toHaveBeenCalledWith(product);
    expect(deleteIngredientPrismaMethod).toHaveBeenCalledTimes(1);
    expect(deleteIngredientPrismaMethod).toHaveBeenCalledWith({
      where: {
        product_id: product.product_id,
      },
    });
    expect(updatePrismaMethod).not.toHaveBeenCalled();
    expect(updateProductStateWhenExpired).not.toHaveBeenCalled();
    expect(deleteAllProductIngredients).not.toHaveBeenCalled();
    expect(getVisitor).not.toHaveBeenCalled();
    expect(logMethod).toHaveBeenCalled();
    expect(logMethod).toHaveBeenCalledWith(PrismaDisconnectError.message, expect.any(String));
  });
});

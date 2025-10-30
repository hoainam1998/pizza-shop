import { PrismaClient } from 'generated/prisma';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import { PrismaDisconnectError } from '@share/test/pre-setup/mock/errors/prisma-errors';
import { RpcException } from '@nestjs/microservices';
import startUp from './pre-setup';
import ProductController from '../product.controller';
import ProductService from '../product.service';
import { product } from '@share/test/pre-setup/mock/data/product';
import { PRISMA_CLIENT } from '@share/di-token';
import { BadRequestException } from '@nestjs/common';
import { createMessage } from '@share/utils';
import messages from '@share/constants/messages';
import IngredientCachingService from '@share/libs/caching/ingredient/ingredient.service';

let productController: ProductController;
let productService: ProductService;
let prismaService: PrismaClient;
let ingredientCachingService: IngredientCachingService;

beforeEach(async () => {
  const moduleRef = await startUp();

  productService = moduleRef.get(ProductService);
  productController = moduleRef.get(ProductController);
  prismaService = moduleRef.get(PRISMA_CLIENT);
  ingredientCachingService = moduleRef.get(IngredientCachingService);
});

describe('create product', () => {
  it('create product was success', async () => {
    expect.hasAssertions();
    const deleteAllProductIngredients = jest
      .spyOn(ingredientCachingService, 'deleteAllProductIngredients')
      .mockResolvedValue(1);
    const deleteProductWhenExpired = jest.spyOn(productService as any, 'deleteProductWhenExpired');
    const createPrismaMethod = jest.spyOn(prismaService.product, 'create').mockResolvedValue(product);
    const createMethodService = jest.spyOn(productService, 'createProduct');
    const createMethodController = jest.spyOn(productController, 'createProduct');
    await expect(productController.createProduct(product)).resolves.toBe(product);
    expect(createMethodController).toHaveBeenCalledTimes(1);
    expect(createMethodController).toHaveBeenCalledWith(product);
    expect(createMethodService).toHaveBeenCalledTimes(1);
    expect(createMethodService).toHaveBeenCalledWith(product);
    expect(createPrismaMethod).toHaveBeenCalledTimes(1);
    expect(createPrismaMethod).toHaveBeenCalledWith({
      data: product,
    });
    expect(deleteProductWhenExpired).toHaveBeenCalledTimes(1);
    expect(deleteProductWhenExpired).toHaveBeenCalledWith(product, productService.createProduct.name);
    expect(deleteAllProductIngredients).toHaveBeenCalledTimes(1);
    expect(deleteAllProductIngredients).toHaveBeenCalledWith(product.product_id);
  });

  it('create product failed with unknown error', async () => {
    expect.hasAssertions();
    const deleteAllProductIngredients = jest.spyOn(ingredientCachingService, 'deleteAllProductIngredients');
    const deleteProductWhenExpired = jest.spyOn(productService as any, 'deleteProductWhenExpired');
    const createPrismaMethod = jest.spyOn(prismaService.product, 'create').mockRejectedValue(UnknownError);
    const createMethodService = jest.spyOn(productService, 'createProduct');
    const createMethodController = jest.spyOn(productController, 'createProduct');
    await expect(productController.createProduct(product)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(messages.COMMON.COMMON_ERROR))),
    );
    expect(createMethodController).toHaveBeenCalledTimes(1);
    expect(createMethodController).toHaveBeenCalledWith(product);
    expect(createMethodService).toHaveBeenCalledTimes(1);
    expect(createMethodService).toHaveBeenCalledWith(product);
    expect(createPrismaMethod).toHaveBeenCalledTimes(1);
    expect(createPrismaMethod).toHaveBeenCalledWith({
      data: product,
    });
    expect(deleteProductWhenExpired).not.toHaveBeenCalled();
    expect(deleteAllProductIngredients).not.toHaveBeenCalled();
  });

  it('create product failed with database disconnect error', async () => {
    expect.hasAssertions();
    const deleteAllProductIngredients = jest.spyOn(ingredientCachingService, 'deleteAllProductIngredients');
    const deleteProductWhenExpired = jest.spyOn(productService as any, 'deleteProductWhenExpired');
    const createPrismaMethod = jest.spyOn(prismaService.product, 'create').mockRejectedValue(PrismaDisconnectError);
    const createMethodService = jest.spyOn(productService, 'createProduct');
    const createMethodController = jest.spyOn(productController, 'createProduct');
    await expect(productController.createProduct(product)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(PrismaDisconnectError.message))),
    );
    expect(createMethodController).toHaveBeenCalledTimes(1);
    expect(createMethodController).toHaveBeenCalledWith(product);
    expect(createMethodService).toHaveBeenCalledTimes(1);
    expect(createMethodService).toHaveBeenCalledWith(product);
    expect(createPrismaMethod).toHaveBeenCalledTimes(1);
    expect(createPrismaMethod).toHaveBeenCalledWith({
      data: product,
    });
    expect(deleteProductWhenExpired).not.toHaveBeenCalled();
    expect(deleteAllProductIngredients).not.toHaveBeenCalled();
  });
});

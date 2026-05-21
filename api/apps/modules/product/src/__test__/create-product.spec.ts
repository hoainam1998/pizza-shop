import { ClientProxy, RpcException } from '@nestjs/microservices';
import { PrismaClient } from 'generated/prisma';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import { PrismaDisconnectError } from '@share/test/pre-setup/mock/errors/prisma-errors';
import startUp from './pre-setup';
import ProductController from '../product.controller';
import ProductService from '../product.service';
import { product } from '@share/test/pre-setup/mock/data/product';
import { PRISMA_CLIENT, SOCKET_SERVICE } from '@share/di-token';
import { BadRequestException } from '@nestjs/common';
import { createMessage } from '@share/utils';
import messages from '@share/constants/messages';
import IngredientCachingService from '@share/libs/caching/ingredient/ingredient.service';
import { refreshAllProductsPattern } from '@share/pattern';

let productController: ProductController;
let productService: ProductService;
let prismaService: PrismaClient;
let ingredientCachingService: IngredientCachingService;
let socketGateway: ClientProxy;

beforeAll(async () => {
  const moduleRef = await startUp();
  productService = moduleRef.get(ProductService);
  productController = moduleRef.get(ProductController);
  prismaService = moduleRef.get(PRISMA_CLIENT);
  socketGateway = moduleRef.get(SOCKET_SERVICE);
  ingredientCachingService = moduleRef.get(IngredientCachingService);
});

describe('create product', () => {
  it('create product was success', async () => {
    expect.hasAssertions();
    const emit = jest.spyOn(socketGateway, 'emit').mockImplementation(jest.fn());
    const deleteAllProductIngredients = jest
      .spyOn(ingredientCachingService, 'deleteAllProductIngredients')
      .mockResolvedValue(1);
    const updateProductStateWhenExpired = jest.spyOn(productService as any, 'updateProductStateWhenExpired');
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
    expect(updateProductStateWhenExpired).toHaveBeenCalledTimes(1);
    expect(updateProductStateWhenExpired).toHaveBeenCalledWith(product, productService.createProduct.name);
    expect(deleteAllProductIngredients).toHaveBeenCalledTimes(1);
    expect(deleteAllProductIngredients).toHaveBeenCalledWith(product.product_id);
    expect(emit).toHaveBeenCalledTimes(1);
    expect(emit).toHaveBeenCalledWith(refreshAllProductsPattern, {});
  });

  it('create product failed with unknown error', async () => {
    expect.hasAssertions();
    const emit = jest.spyOn(socketGateway, 'emit').mockImplementation(jest.fn());
    const deleteAllProductIngredients = jest.spyOn(ingredientCachingService, 'deleteAllProductIngredients');
    const updateProductStateWhenExpired = jest.spyOn(productService as any, 'updateProductStateWhenExpired');
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
    expect(updateProductStateWhenExpired).not.toHaveBeenCalled();
    expect(deleteAllProductIngredients).not.toHaveBeenCalled();
    expect(emit).not.toHaveBeenCalled();
  });

  it('create product failed with database disconnect error', async () => {
    expect.hasAssertions();
    const emit = jest.spyOn(socketGateway, 'emit').mockImplementation(jest.fn());
    const deleteAllProductIngredients = jest.spyOn(ingredientCachingService, 'deleteAllProductIngredients');
    const updateProductStateWhenExpired = jest.spyOn(productService as any, 'updateProductStateWhenExpired');
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
    expect(updateProductStateWhenExpired).not.toHaveBeenCalled();
    expect(deleteAllProductIngredients).not.toHaveBeenCalled();
    expect(emit).not.toHaveBeenCalled();
  });
});

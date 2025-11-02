import { PrismaClient } from 'generated/prisma';
import startUp from './pre-setup';
import ProductController from '../product.controller';
import ProductService from '../product.service';
import { product } from '@share/test/pre-setup/mock/data/product';
import { PRISMA_CLIENT } from '@share/di-token';
import LoggingService from '@share/libs/logging/logging.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaDisconnectError, PrismaNotFoundError } from '@share/test/pre-setup/mock/errors/prisma-errors';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import messages from '@share/constants/messages';
import { createMessage } from '@share/utils';
delete product.ingredients;

let productController: ProductController;
let productService: ProductService;
let prismaService: PrismaClient;
let loggerService: LoggingService;

const query = {
  product_id: true,
  name: true,
  avatar: true,
  count: true,
  price: true,
  status: true,
  product_ingredient: {
    select: {
      ingredient_id: true,
      count: true,
      unit: true,
      ingredient: {
        select: {
          name: true,
          avatar: true,
        },
      },
    },
  },
  _count: false,
  expired_time: true,
  original_price: true,
  category_id: true,
};

const getProductBody: any = {
  productId: product.product_id,
  query,
};

beforeEach(async () => {
  const moduleRef = await startUp();

  productService = moduleRef.get(ProductService);
  productController = moduleRef.get(ProductController);
  loggerService = moduleRef.get(LoggingService);
  prismaService = moduleRef.get(PRISMA_CLIENT);
});

afterEach((done) => {
  jest.restoreAllMocks();
  jest.resetAllMocks();
  done();
});

describe('get product', () => {
  it('get product was success', async () => {
    expect.hasAssertions();
    const findUniqueOrThrowPrismaMethod = jest
      .spyOn(prismaService.product, 'findUniqueOrThrow')
      .mockResolvedValue(product);
    const getDetailServiceMethod = jest.spyOn(productService, 'getProduct');
    const getAllControllerMethod = jest.spyOn(productController, 'getProduct');
    await expect(productController.getProduct(getProductBody)).resolves.toBe(product);
    expect(getAllControllerMethod).toHaveBeenCalledTimes(1);
    expect(getAllControllerMethod).toHaveBeenCalledWith(getProductBody);
    expect(getDetailServiceMethod).toHaveBeenCalledTimes(1);
    expect(getDetailServiceMethod).toHaveBeenCalledWith(getProductBody);
    expect(findUniqueOrThrowPrismaMethod).toHaveBeenCalledTimes(1);
    expect(findUniqueOrThrowPrismaMethod).toHaveBeenLastCalledWith({
      where: {
        product_id: getProductBody.productId,
      },
      select: getProductBody.query,
    });
  });

  it('get product failed with not found error', async () => {
    expect.hasAssertions();
    const findUniqueOrThrowPrismaMethod = jest
      .spyOn(prismaService.product, 'findUniqueOrThrow')
      .mockRejectedValue(PrismaNotFoundError);
    const logMethod = jest.spyOn(loggerService, 'error');
    const getDetailServiceMethod = jest.spyOn(productService, 'getProduct');
    const getAllControllerMethod = jest.spyOn(productController, 'getProduct');
    await expect(productController.getProduct(getProductBody)).rejects.toThrow(
      new RpcException(new NotFoundException(messages.PRODUCT.NOT_FOUND)),
    );
    expect(getAllControllerMethod).toHaveBeenCalledTimes(1);
    expect(getAllControllerMethod).toHaveBeenCalledWith(getProductBody);
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(messages.PRODUCT.NOT_FOUND, expect.any(String));
    expect(getDetailServiceMethod).toHaveBeenCalledTimes(1);
    expect(getDetailServiceMethod).toHaveBeenCalledWith(getProductBody);
    expect(findUniqueOrThrowPrismaMethod).toHaveBeenCalledTimes(1);
    expect(findUniqueOrThrowPrismaMethod).toHaveBeenLastCalledWith({
      where: {
        product_id: getProductBody.productId,
      },
      select: getProductBody.query,
    });
  });

  it('get product failed with unknown error', async () => {
    expect.hasAssertions();
    const findUniqueOrThrowPrismaMethod = jest
      .spyOn(prismaService.product, 'findUniqueOrThrow')
      .mockRejectedValue(UnknownError);
    const logMethod = jest.spyOn(loggerService, 'error');
    const getDetailServiceMethod = jest.spyOn(productService, 'getProduct');
    const getAllControllerMethod = jest.spyOn(productController, 'getProduct');
    await expect(productController.getProduct(getProductBody)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(messages.COMMON.COMMON_ERROR))),
    );
    expect(getAllControllerMethod).toHaveBeenCalledTimes(1);
    expect(getAllControllerMethod).toHaveBeenCalledWith(getProductBody);
    expect(logMethod).toHaveBeenCalledWith(UnknownError.message, expect.any(String));
    expect(getDetailServiceMethod).toHaveBeenCalledTimes(1);
    expect(getDetailServiceMethod).toHaveBeenCalledWith(getProductBody);
    expect(findUniqueOrThrowPrismaMethod).toHaveBeenCalledTimes(1);
    expect(findUniqueOrThrowPrismaMethod).toHaveBeenLastCalledWith({
      where: {
        product_id: getProductBody.productId,
      },
      select: getProductBody.query,
    });
  });

  it('get product failed with database disconnect error', async () => {
    expect.hasAssertions();
    const findUniqueOrThrowPrismaMethod = jest
      .spyOn(prismaService.product, 'findUniqueOrThrow')
      .mockRejectedValue(PrismaDisconnectError);
    const logMethod = jest.spyOn(loggerService, 'error');
    const getDetailServiceMethod = jest.spyOn(productService, 'getProduct');
    const getAllControllerMethod = jest.spyOn(productController, 'getProduct');
    await expect(productController.getProduct(getProductBody)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(PrismaDisconnectError.message))),
    );
    expect(getAllControllerMethod).toHaveBeenCalledTimes(1);
    expect(getAllControllerMethod).toHaveBeenCalledWith(getProductBody);
    expect(logMethod).toHaveBeenCalledWith(PrismaDisconnectError.message, expect.any(String));
    expect(getDetailServiceMethod).toHaveBeenCalledTimes(1);
    expect(getDetailServiceMethod).toHaveBeenCalledWith(getProductBody);
    expect(findUniqueOrThrowPrismaMethod).toHaveBeenCalledTimes(1);
    expect(findUniqueOrThrowPrismaMethod).toHaveBeenLastCalledWith({
      where: {
        product_id: getProductBody.productId,
      },
      select: getProductBody.query,
    });
  });
});

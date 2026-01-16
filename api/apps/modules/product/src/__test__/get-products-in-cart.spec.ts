import { PrismaClient, Status } from 'generated/prisma';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import startUp from './pre-setup';
import ProductController from '../product.controller';
import ProductService from '../product.service';
import { createProductList } from '@share/test/pre-setup/mock/data/product';
import { user } from '@share/test/pre-setup/mock/data/user';
import LoggingService from '@share/libs/logging/logging.service';
import { PRISMA_CLIENT } from '@share/di-token';
import { createMessage } from '@share/utils';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import messages from '@share/constants/messages';
import { PrismaDisconnectError } from '@share/test/pre-setup/mock/errors/prisma-errors';
import ProductCachingService from '@share/libs/caching/product/product.service';

let productController: ProductController;
let productService: ProductService;
let loggerService: LoggingService;
let productCachingService: ProductCachingService;
let prismaService: PrismaClient;

const query = {
  name: true,
  avatar: true,
  count: true,
  price: true,
  product_id: true,
};

const length = 2;
const productList = createProductList(length);
const productIds = productList.map((product) => product.product_id);

const body: any = {
  productIds: productIds,
  query,
};
const payload = {
  userId: user.user_id,
  select: body,
};
const result = 1;
const setVisitorParameters = productIds.map((id) => [id, payload.userId]);

beforeEach(async () => {
  const moduleRef = await startUp();

  productService = moduleRef.get(ProductService);
  productController = moduleRef.get(ProductController);
  productCachingService = moduleRef.get(ProductCachingService);
  loggerService = moduleRef.get(LoggingService);
  prismaService = moduleRef.get(PRISMA_CLIENT);
});

describe('get products in cart', () => {
  it('get products in cart was success', async () => {
    expect.hasAssertions();
    const findMany = jest.spyOn(prismaService.product, 'findMany').mockResolvedValue(productList);
    const setVisitor = jest.spyOn(productCachingService, 'setVisitor').mockResolvedValue(result);
    const setProductsAccessByVisitor = jest
      .spyOn(productCachingService, 'setProductsAccessByVisitor')
      .mockResolvedValue(result);
    const getProductsInCartServiceMethod = jest.spyOn(productService, 'getProductsInCart');
    const getProductsInCartControllerMethod = jest.spyOn(productController, 'getProductsInCart');
    await expect(productController.getProductsInCart(payload)).resolves.toEqual(productList);
    expect(getProductsInCartControllerMethod).toHaveBeenCalledTimes(1);
    expect(getProductsInCartControllerMethod).toHaveBeenCalledWith(payload);
    expect(getProductsInCartServiceMethod).toHaveBeenCalledTimes(1);
    expect(getProductsInCartServiceMethod).toHaveBeenCalledWith(payload.userId, payload.select);
    expect(findMany).toHaveBeenCalledTimes(1);
    expect(findMany).toHaveBeenCalledWith({
      select: payload.select.query,
      where: {
        OR: [
          {
            status: Status.IN_STOCK,
          },
          {
            status: Status.LESS,
          },
        ],
        product_id: {
          in: payload.select.productIds,
        },
      },
    });
    expect(setVisitor).toHaveBeenCalledTimes(length);
    expect(setVisitor.mock.calls).toEqual(setVisitorParameters);
    expect(setProductsAccessByVisitor).toHaveBeenCalledTimes(1);
    expect(setProductsAccessByVisitor).toHaveBeenCalledWith(productIds, payload.userId);
  });

  it('get products in cart failed with not found error', async () => {
    expect.hasAssertions();
    const findMany = jest.spyOn(prismaService.product, 'findMany').mockResolvedValue([]);
    const setVisitor = jest.spyOn(productCachingService, 'setVisitor');
    const setProductsAccessByVisitor = jest.spyOn(productCachingService, 'setProductsAccessByVisitor');
    const getProductsInCartServiceMethod = jest.spyOn(productService, 'getProductsInCart');
    const getProductsInCartControllerMethod = jest.spyOn(productController, 'getProductsInCart');
    await expect(productController.getProductsInCart(payload)).rejects.toThrow(
      new RpcException(new NotFoundException([])),
    );
    expect(getProductsInCartControllerMethod).toHaveBeenCalledTimes(1);
    expect(getProductsInCartControllerMethod).toHaveBeenCalledWith(payload);
    expect(getProductsInCartServiceMethod).toHaveBeenCalledTimes(1);
    expect(getProductsInCartServiceMethod).toHaveBeenCalledWith(payload.userId, payload.select);
    expect(findMany).toHaveBeenCalledTimes(1);
    expect(findMany).toHaveBeenCalledWith({
      select: payload.select.query,
      where: {
        OR: [
          {
            status: Status.IN_STOCK,
          },
          {
            status: Status.LESS,
          },
        ],
        product_id: {
          in: payload.select.productIds,
        },
      },
    });
    expect(setVisitor).not.toHaveBeenCalled();
    expect(setProductsAccessByVisitor).toHaveBeenCalledTimes(1);
    expect(setProductsAccessByVisitor).toHaveBeenLastCalledWith([], payload.userId);
  });

  it('get products in cart failed with unknown error', async () => {
    expect.hasAssertions();
    const log = jest.spyOn(loggerService, 'error');
    const findMany = jest.spyOn(prismaService.product, 'findMany').mockRejectedValue(UnknownError);
    const setVisitor = jest.spyOn(productCachingService, 'setVisitor');
    const setProductsAccessByVisitor = jest.spyOn(productCachingService, 'setProductsAccessByVisitor');
    const getProductsInCartServiceMethod = jest.spyOn(productService, 'getProductsInCart');
    const getProductsInCartControllerMethod = jest.spyOn(productController, 'getProductsInCart');
    await expect(productController.getProductsInCart(payload)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(messages.COMMON.COMMON_ERROR))),
    );
    expect(getProductsInCartControllerMethod).toHaveBeenCalledTimes(1);
    expect(getProductsInCartControllerMethod).toHaveBeenCalledWith(payload);
    expect(getProductsInCartServiceMethod).toHaveBeenCalledTimes(1);
    expect(getProductsInCartServiceMethod).toHaveBeenCalledWith(payload.userId, payload.select);
    expect(findMany).toHaveBeenCalledTimes(1);
    expect(findMany).toHaveBeenCalledWith({
      select: payload.select.query,
      where: {
        OR: [
          {
            status: Status.IN_STOCK,
          },
          {
            status: Status.LESS,
          },
        ],
        product_id: {
          in: payload.select.productIds,
        },
      },
    });
    expect(setVisitor).not.toHaveBeenCalled();
    expect(setProductsAccessByVisitor).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenCalledWith(UnknownError.message, expect.any(String));
  });

  it('get products in cart failed with setVisitor got unknown error', async () => {
    expect.hasAssertions();
    const log = jest.spyOn(loggerService, 'error');
    const findMany = jest.spyOn(prismaService.product, 'findMany').mockResolvedValue(productList);
    const setVisitor = jest.spyOn(productCachingService, 'setVisitor').mockRejectedValue(UnknownError);
    const setProductsAccessByVisitor = jest.spyOn(productCachingService, 'setProductsAccessByVisitor');
    const getProductsInCartServiceMethod = jest.spyOn(productService, 'getProductsInCart');
    const getProductsInCartControllerMethod = jest.spyOn(productController, 'getProductsInCart');
    await expect(productController.getProductsInCart(payload)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(messages.COMMON.COMMON_ERROR))),
    );
    expect(getProductsInCartControllerMethod).toHaveBeenCalledTimes(1);
    expect(getProductsInCartControllerMethod).toHaveBeenCalledWith(payload);
    expect(getProductsInCartServiceMethod).toHaveBeenCalledTimes(1);
    expect(getProductsInCartServiceMethod).toHaveBeenCalledWith(payload.userId, payload.select);
    expect(findMany).toHaveBeenCalledTimes(1);
    expect(findMany).toHaveBeenCalledWith({
      select: payload.select.query,
      where: {
        OR: [
          {
            status: Status.IN_STOCK,
          },
          {
            status: Status.LESS,
          },
        ],
        product_id: {
          in: payload.select.productIds,
        },
      },
    });
    expect(setVisitor).toHaveBeenCalledTimes(length);
    expect(setVisitor.mock.calls).toEqual(setVisitorParameters);
    expect(setProductsAccessByVisitor).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenCalledWith(UnknownError.message, expect.any(String));
  });

  it('get products in cart failed with setVisitor got unknown error', async () => {
    expect.hasAssertions();
    const log = jest.spyOn(loggerService, 'error');
    const findMany = jest.spyOn(prismaService.product, 'findMany').mockResolvedValue(productList);
    const setVisitor = jest.spyOn(productCachingService, 'setVisitor').mockResolvedValue(result);
    const setProductsAccessByVisitor = jest
      .spyOn(productCachingService, 'setProductsAccessByVisitor')
      .mockRejectedValue(UnknownError);
    const getProductsInCartServiceMethod = jest.spyOn(productService, 'getProductsInCart');
    const getProductsInCartControllerMethod = jest.spyOn(productController, 'getProductsInCart');
    await expect(productController.getProductsInCart(payload)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(messages.COMMON.COMMON_ERROR))),
    );
    expect(getProductsInCartControllerMethod).toHaveBeenCalledTimes(1);
    expect(getProductsInCartControllerMethod).toHaveBeenCalledWith(payload);
    expect(getProductsInCartServiceMethod).toHaveBeenCalledTimes(1);
    expect(getProductsInCartServiceMethod).toHaveBeenCalledWith(payload.userId, payload.select);
    expect(findMany).toHaveBeenCalledTimes(1);
    expect(findMany).toHaveBeenCalledWith({
      select: payload.select.query,
      where: {
        OR: [
          {
            status: Status.IN_STOCK,
          },
          {
            status: Status.LESS,
          },
        ],
        product_id: {
          in: payload.select.productIds,
        },
      },
    });
    expect(setVisitor).toHaveBeenCalledTimes(length);
    expect(setVisitor.mock.calls).toEqual(setVisitorParameters);
    expect(setProductsAccessByVisitor).toHaveBeenCalledTimes(1);
    expect(setProductsAccessByVisitor).toHaveBeenCalledWith(productIds, payload.userId);
    expect(log).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenCalledWith(UnknownError.message, expect.any(String));
  });

  it('get products in cart failed with database disconnect error', async () => {
    expect.hasAssertions();
    const log = jest.spyOn(loggerService, 'error');
    const findMany = jest.spyOn(prismaService.product, 'findMany').mockRejectedValue(PrismaDisconnectError);
    const setVisitor = jest.spyOn(productCachingService, 'setVisitor');
    const setProductsAccessByVisitor = jest.spyOn(productCachingService, 'setProductsAccessByVisitor');
    const getProductsInCartServiceMethod = jest.spyOn(productService, 'getProductsInCart');
    const getProductsInCartControllerMethod = jest.spyOn(productController, 'getProductsInCart');
    await expect(productController.getProductsInCart(payload)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(PrismaDisconnectError.message))),
    );
    expect(getProductsInCartControllerMethod).toHaveBeenCalledTimes(1);
    expect(getProductsInCartControllerMethod).toHaveBeenCalledWith(payload);
    expect(getProductsInCartServiceMethod).toHaveBeenCalledTimes(1);
    expect(getProductsInCartServiceMethod).toHaveBeenCalledWith(payload.userId, payload.select);
    expect(findMany).toHaveBeenCalledTimes(1);
    expect(findMany).toHaveBeenCalledWith({
      select: payload.select.query,
      where: {
        OR: [
          {
            status: Status.IN_STOCK,
          },
          {
            status: Status.LESS,
          },
        ],
        product_id: {
          in: payload.select.productIds,
        },
      },
    });
    expect(setVisitor).not.toHaveBeenCalled();
    expect(setProductsAccessByVisitor).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenCalledWith(PrismaDisconnectError.message, expect.any(String));
  });
});

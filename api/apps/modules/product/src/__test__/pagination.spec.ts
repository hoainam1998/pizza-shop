import { BadRequestException, NotFoundException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaClient } from 'generated/prisma';
import startUp from './pre-setup';
import ProductController from '../product.controller';
import ProductService from '../product.service';
import { product, createProductList } from '@share/test/pre-setup/mock/data/product';
import { PRISMA_CLIENT } from '@share/di-token';
import LoggingService from '@share/libs/logging/logging.service';
import { calcSkip, createMessage } from '@share/utils';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import messages from '@share/constants/messages';
import { PrismaDisconnectError } from '@share/test/pre-setup/mock/errors/prisma-errors';

let productController: ProductController;
let productService: ProductService;
let prismaService: PrismaClient;
let loggerService: LoggingService;

const query = {
  name: true,
  avatar: true,
  count: true,
  price: true,
  original_price: true,
  status: true,
  expired_time: true,
  category: true,
  _count: {
    select: {
      bill_detail: true,
    },
  },
};

const length = 2;
const paginationBody: any = {
  pageSize: 10,
  pageNumber: 1,
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

describe('product pagination', () => {
  it('product pagination was success', async () => {
    expect.hasAssertions();
    const skip = calcSkip(paginationBody.pageSize, paginationBody.pageNumber);
    const productList = createProductList(length);
    const transactionResults = [productList, length];
    const findManyPrismaMethod = jest.spyOn(prismaService.product, 'findMany');
    const countPrismaMethod = jest.spyOn(prismaService.product, 'count');
    const transactionPrismaMethod = jest.spyOn(prismaService, '$transaction').mockResolvedValue(transactionResults);
    const paginationServiceMethod = jest.spyOn(productService, 'pagination');
    const paginationControllerMethod = jest.spyOn(productController, 'pagination');
    await expect(productController.pagination(paginationBody)).resolves.toEqual({
      list: transactionResults[0],
      total: transactionResults[1],
    });
    expect(paginationControllerMethod).toHaveBeenCalledTimes(1);
    expect(paginationControllerMethod).toHaveBeenCalledWith(paginationBody);
    expect(paginationServiceMethod).toHaveBeenCalledTimes(1);
    expect(paginationServiceMethod).toHaveBeenCalledWith(paginationBody);
    expect(transactionPrismaMethod).toHaveBeenCalledTimes(1);
    expect(transactionPrismaMethod).toHaveBeenCalledWith(expect.any(Array));
    expect(findManyPrismaMethod).toHaveBeenCalledTimes(1);
    expect(findManyPrismaMethod).toHaveBeenLastCalledWith({
      select: paginationBody.query,
      take: paginationBody.pageSize,
      skip,
      where: {},
      orderBy: {
        product_id: 'desc',
      },
    });
    expect(countPrismaMethod).toHaveBeenCalledTimes(1);
  });

  it('product pagination was success with key word', async () => {
    expect.hasAssertions();
    const paginationBodyWithKeyword = {
      ...paginationBody,
      search: product.name,
    };
    const skip = calcSkip(paginationBody.pageSize, paginationBody.pageNumber);
    const productList = createProductList(length);
    const transactionResults = [productList, length];
    const findManyPrismaMethod = jest.spyOn(prismaService.product, 'findMany');
    const countPrismaMethod = jest.spyOn(prismaService.product, 'count');
    const transactionPrismaMethod = jest.spyOn(prismaService, '$transaction').mockResolvedValue(transactionResults);
    const paginationServiceMethod = jest.spyOn(productService, 'pagination');
    const paginationControllerMethod = jest.spyOn(productController, 'pagination');
    await expect(productController.pagination(paginationBodyWithKeyword)).resolves.toEqual({
      list: transactionResults[0],
      total: transactionResults[1],
    });
    expect(paginationControllerMethod).toHaveBeenCalledTimes(1);
    expect(paginationControllerMethod).toHaveBeenCalledWith(paginationBodyWithKeyword);
    expect(paginationServiceMethod).toHaveBeenCalledTimes(1);
    expect(paginationServiceMethod).toHaveBeenCalledWith(paginationBodyWithKeyword);
    expect(transactionPrismaMethod).toHaveBeenCalledTimes(1);
    expect(transactionPrismaMethod).toHaveBeenCalledWith(expect.any(Array));
    expect(findManyPrismaMethod).toHaveBeenCalledTimes(1);
    expect(findManyPrismaMethod).toHaveBeenLastCalledWith({
      select: paginationBodyWithKeyword.query,
      take: paginationBodyWithKeyword.pageSize,
      skip,
      where: {
        name: {
          contains: paginationBodyWithKeyword.search,
        },
      },
      orderBy: {
        product_id: 'desc',
      },
    });
    expect(countPrismaMethod).toHaveBeenCalledTimes(1);
  });

  it('product pagination failed with not found error', async () => {
    expect.hasAssertions();
    const skip = calcSkip(paginationBody.pageSize, paginationBody.pageNumber);
    const findManyPrismaMethod = jest.spyOn(prismaService.product, 'findMany');
    const countPrismaMethod = jest.spyOn(prismaService.product, 'count');
    const transactionPrismaMethod = jest.spyOn(prismaService, '$transaction').mockResolvedValue([[], 0]);
    const paginationServiceMethod = jest.spyOn(productService, 'pagination');
    const paginationControllerMethod = jest.spyOn(productController, 'pagination');
    await expect(productController.pagination(paginationBody)).rejects.toThrow(
      new RpcException(
        new NotFoundException({
          list: [],
          total: 0,
        }),
      ),
    );
    expect(paginationControllerMethod).toHaveBeenCalledTimes(1);
    expect(paginationControllerMethod).toHaveBeenCalledWith(paginationBody);
    expect(paginationServiceMethod).toHaveBeenCalledTimes(1);
    expect(paginationServiceMethod).toHaveBeenCalledWith(paginationBody);
    expect(transactionPrismaMethod).toHaveBeenCalledTimes(1);
    expect(transactionPrismaMethod).toHaveBeenCalledWith(expect.any(Array));
    expect(findManyPrismaMethod).toHaveBeenCalledTimes(1);
    expect(findManyPrismaMethod).toHaveBeenLastCalledWith({
      select: paginationBody.query,
      take: paginationBody.pageSize,
      skip,
      where: {},
      orderBy: {
        product_id: 'desc',
      },
    });
    expect(countPrismaMethod).toHaveBeenCalledTimes(1);
  });

  it('product pagination failed with unknown error', async () => {
    expect.hasAssertions();
    const skip = calcSkip(paginationBody.pageSize, paginationBody.pageNumber);
    const logMethod = jest.spyOn(loggerService, 'error');
    const findManyPrismaMethod = jest.spyOn(prismaService.product, 'findMany');
    const countPrismaMethod = jest.spyOn(prismaService.product, 'count');
    const transactionPrismaMethod = jest.spyOn(prismaService, '$transaction').mockRejectedValue(UnknownError);
    const paginationServiceMethod = jest.spyOn(productService, 'pagination');
    const paginationControllerMethod = jest.spyOn(productController, 'pagination');
    await expect(productController.pagination(paginationBody)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(messages.COMMON.COMMON_ERROR))),
    );
    expect(paginationControllerMethod).toHaveBeenCalledTimes(1);
    expect(paginationControllerMethod).toHaveBeenCalledWith(paginationBody);
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(UnknownError.message, expect.any(String));
    expect(paginationServiceMethod).toHaveBeenCalledTimes(1);
    expect(paginationServiceMethod).toHaveBeenCalledWith(paginationBody);
    expect(transactionPrismaMethod).toHaveBeenCalledTimes(1);
    expect(transactionPrismaMethod).toHaveBeenCalledWith(expect.any(Array));
    expect(findManyPrismaMethod).toHaveBeenCalledTimes(1);
    expect(findManyPrismaMethod).toHaveBeenLastCalledWith({
      select: paginationBody.query,
      take: paginationBody.pageSize,
      skip,
      where: {},
      orderBy: {
        product_id: 'desc',
      },
    });
    expect(countPrismaMethod).toHaveBeenCalledTimes(1);
  });

  it('product pagination failed with database disconnect error', async () => {
    expect.hasAssertions();
    const skip = calcSkip(paginationBody.pageSize, paginationBody.pageNumber);
    const logMethod = jest.spyOn(loggerService, 'error');
    const findManyPrismaMethod = jest.spyOn(prismaService.product, 'findMany');
    const countPrismaMethod = jest.spyOn(prismaService.product, 'count');
    const transactionPrismaMethod = jest.spyOn(prismaService, '$transaction').mockRejectedValue(PrismaDisconnectError);
    const paginationServiceMethod = jest.spyOn(productService, 'pagination');
    const paginationControllerMethod = jest.spyOn(productController, 'pagination');
    await expect(productController.pagination(paginationBody)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(PrismaDisconnectError.message))),
    );
    expect(paginationControllerMethod).toHaveBeenCalledTimes(1);
    expect(paginationControllerMethod).toHaveBeenCalledWith(paginationBody);
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(PrismaDisconnectError.message, expect.any(String));
    expect(paginationServiceMethod).toHaveBeenCalledTimes(1);
    expect(paginationServiceMethod).toHaveBeenCalledWith(paginationBody);
    expect(transactionPrismaMethod).toHaveBeenCalledTimes(1);
    expect(transactionPrismaMethod).toHaveBeenCalledWith(expect.any(Array));
    expect(findManyPrismaMethod).toHaveBeenCalledTimes(1);
    expect(findManyPrismaMethod).toHaveBeenLastCalledWith({
      select: paginationBody.query,
      take: paginationBody.pageSize,
      skip,
      where: {},
      orderBy: {
        product_id: 'desc',
      },
    });
    expect(countPrismaMethod).toHaveBeenCalledTimes(1);
  });
});

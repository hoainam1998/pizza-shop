import { BadRequestException, NotFoundException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import startUp from './pre-setup';
import ProductController from '../product.controller';
import ProductService from '../product.service';
import { product, createProductList } from '@share/test/pre-setup/mock/data/product';
import LoggingService from '@share/libs/logging/logging.service';
import { createMessage } from '@share/utils';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import messages from '@share/constants/messages';
import { PrismaDisconnectError } from '@share/test/pre-setup/mock/errors/prisma-errors';

let productController: ProductController;
let productService: ProductService;
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
const productList = createProductList(length);
const transactionResults = [productList, length];

beforeEach(async () => {
  const moduleRef = await startUp();

  productService = moduleRef.get(ProductService);
  productController = moduleRef.get(ProductController);
  loggerService = moduleRef.get(LoggingService);
});

describe('product pagination', () => {
  it('product pagination was success', async () => {
    expect.hasAssertions();
    const handlePagination = jest
      .spyOn(productService as any, 'handlePagination')
      .mockResolvedValue(transactionResults);
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
    expect(handlePagination).toHaveBeenCalledTimes(1);
    expect(handlePagination).toHaveBeenCalledWith(paginationBody);
  });

  it('product pagination was success with key word', async () => {
    expect.hasAssertions();
    const paginationBodyWithKeyword = {
      ...paginationBody,
      search: product.name,
    };
    const handlePagination = jest
      .spyOn(productService as any, 'handlePagination')
      .mockResolvedValue(transactionResults);
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
    expect(handlePagination).toHaveBeenCalledTimes(1);
    expect(handlePagination).toHaveBeenCalledWith(paginationBodyWithKeyword);
  });

  it('product pagination was success with categoryId', async () => {
    expect.hasAssertions();
    const paginationBodyWithCategoryId = {
      ...paginationBody,
      categoryId: product.category_id,
    };
    const handlePagination = jest
      .spyOn(productService as any, 'handlePagination')
      .mockResolvedValue(transactionResults);
    const paginationServiceMethod = jest.spyOn(productService, 'pagination');
    const paginationControllerMethod = jest.spyOn(productController, 'pagination');
    await expect(productController.pagination(paginationBodyWithCategoryId)).resolves.toEqual({
      list: transactionResults[0],
      total: transactionResults[1],
    });
    expect(paginationControllerMethod).toHaveBeenCalledTimes(1);
    expect(paginationControllerMethod).toHaveBeenCalledWith(paginationBodyWithCategoryId);
    expect(paginationServiceMethod).toHaveBeenCalledTimes(1);
    expect(paginationServiceMethod).toHaveBeenCalledWith(paginationBodyWithCategoryId);
    expect(handlePagination).toHaveBeenCalledTimes(1);
    expect(handlePagination).toHaveBeenCalledWith(paginationBodyWithCategoryId);
  });

  it('product pagination was success with a both categoryId and keyword', async () => {
    expect.hasAssertions();
    const paginationBodyWithAllCondition = {
      ...paginationBody,
      categoryId: product.category_id,
      search: product.name,
    };
    const productList = createProductList(length);
    const transactionResults = [productList, length];
    const handlePagination = jest
      .spyOn(productService as any, 'handlePagination')
      .mockResolvedValue(transactionResults);
    const paginationServiceMethod = jest.spyOn(productService, 'pagination');
    const paginationControllerMethod = jest.spyOn(productController, 'pagination');
    await expect(productController.pagination(paginationBodyWithAllCondition)).resolves.toEqual({
      list: transactionResults[0],
      total: transactionResults[1],
    });
    expect(paginationControllerMethod).toHaveBeenCalledTimes(1);
    expect(paginationControllerMethod).toHaveBeenCalledWith(paginationBodyWithAllCondition);
    expect(paginationServiceMethod).toHaveBeenCalledTimes(1);
    expect(paginationServiceMethod).toHaveBeenCalledWith(paginationBodyWithAllCondition);
    expect(handlePagination).toHaveBeenCalledTimes(1);
    expect(handlePagination).toHaveBeenCalledWith(paginationBodyWithAllCondition);
  });

  it('product pagination failed with not found error', async () => {
    expect.hasAssertions();
    const handlePagination = jest.spyOn(productService as any, 'handlePagination').mockResolvedValue([[], 0]);
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
    expect(handlePagination).toHaveBeenCalledTimes(1);
    expect(handlePagination).toHaveBeenCalledWith(paginationBody);
  });

  it('product pagination failed with unknown error', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const handlePagination = jest.spyOn(productService as any, 'handlePagination').mockRejectedValue(UnknownError);
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
    expect(handlePagination).toHaveBeenCalledTimes(1);
    expect(handlePagination).toHaveBeenCalledWith(paginationBody);
  });

  it('product pagination failed with database disconnect error', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const handlePagination = jest
      .spyOn(productService as any, 'handlePagination')
      .mockRejectedValue(PrismaDisconnectError);
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
    expect(handlePagination).toHaveBeenCalledTimes(1);
    expect(handlePagination).toHaveBeenCalledWith(paginationBody);
  });
});

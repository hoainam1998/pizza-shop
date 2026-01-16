import { BadRequestException, NotFoundException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Status } from 'generated/prisma';
import startUp from './pre-setup';
import ProductController from '../product.controller';
import ProductService from '../product.service';
import { product, createProductList } from '@share/test/pre-setup/mock/data/product';
import { user } from '@share/test/pre-setup/mock/data/user';
import LoggingService from '@share/libs/logging/logging.service';
import { createMessage } from '@share/utils';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import messages from '@share/constants/messages';
import { PrismaDisconnectError } from '@share/test/pre-setup/mock/errors/prisma-errors';

let productController: ProductController;
let productService: ProductService;
let loggerService: LoggingService;
const length = 2;

const query = {
  name: true,
  avatar: true,
  count: true,
  price: true,
  product_ingredient: {
    select: {
      unit: true,
      count: true,
      ingredient: {
        select: {
          name: true,
          avatar: true,
        },
      },
    },
  },
};

const paginationBody: any = {
  pageSize: 10,
  pageNumber: 1,
  query,
};
const productList = createProductList(length);
const transactionResults = [productList, length];
const payload = {
  userId: user.user_id,
  select: paginationBody,
};
const where = {
  OR: [
    {
      status: Status.IN_STOCK,
    },
    {
      status: Status.LESS,
    },
  ],
};
const redisServiceResult = 1;

beforeEach(async () => {
  const moduleRef = await startUp();

  productService = moduleRef.get(ProductService);
  productController = moduleRef.get(ProductController);
  loggerService = moduleRef.get(LoggingService);
});

describe('product pagination for sale', () => {
  it('product pagination for sale was success', async () => {
    expect.hasAssertions();
    const setProductAccessByVisitor = jest
      .spyOn(productService as any, 'setProductAccessByVisitor')
      .mockResolvedValue(1);
    const removeOldProductAccessByVisitor = jest
      .spyOn(productService as any, 'removeOldProductAccessByVisitor')
      .mockResolvedValue(1);
    const handlePagination = jest
      .spyOn(productService as any, 'handlePagination')
      .mockResolvedValue(transactionResults);
    const paginationServiceMethod = jest.spyOn(productService, 'paginationForSale');
    const paginationControllerMethod = jest.spyOn(productController, 'paginationForSale');
    await expect(productController.paginationForSale(payload)).resolves.toEqual({
      list: transactionResults[0],
      total: transactionResults[1],
    });
    expect(paginationControllerMethod).toHaveBeenCalledTimes(1);
    expect(paginationControllerMethod).toHaveBeenCalledWith(payload);
    expect(paginationServiceMethod).toHaveBeenCalledTimes(1);
    expect(paginationServiceMethod).toHaveBeenCalledWith(user.user_id, paginationBody);
    expect(handlePagination).toHaveBeenCalledTimes(1);
    expect(handlePagination).toHaveBeenCalledWith(paginationBody, where);
    expect(removeOldProductAccessByVisitor).toHaveBeenCalledTimes(1);
    expect(removeOldProductAccessByVisitor).toHaveBeenCalledWith(user.user_id);
    expect(setProductAccessByVisitor).toHaveBeenCalledTimes(1);
    expect(setProductAccessByVisitor).toHaveBeenCalledWith(transactionResults[0], user.user_id);
  });

  it('product pagination for sale was success with key word', async () => {
    expect.hasAssertions();
    const setProductAccessByVisitor = jest
      .spyOn(productService as any, 'setProductAccessByVisitor')
      .mockResolvedValue(redisServiceResult);
    const removeOldProductAccessByVisitor = jest
      .spyOn(productService as any, 'removeOldProductAccessByVisitor')
      .mockResolvedValue(redisServiceResult);
    const paginationBodyWithKeyword = {
      ...paginationBody,
      search: product.name,
    };
    const payloadAssign = {
      ...payload,
      select: paginationBodyWithKeyword,
    };
    const handlePagination = jest
      .spyOn(productService as any, 'handlePagination')
      .mockResolvedValue(transactionResults);
    const paginationServiceMethod = jest.spyOn(productService, 'paginationForSale');
    const paginationControllerMethod = jest.spyOn(productController, 'paginationForSale');
    await expect(productController.paginationForSale(payloadAssign)).resolves.toEqual({
      list: transactionResults[0],
      total: transactionResults[1],
    });
    expect(paginationControllerMethod).toHaveBeenCalledTimes(1);
    expect(paginationControllerMethod).toHaveBeenCalledWith(payloadAssign);
    expect(paginationServiceMethod).toHaveBeenCalledTimes(1);
    expect(paginationServiceMethod).toHaveBeenCalledWith(user.user_id, paginationBodyWithKeyword);
    expect(handlePagination).toHaveBeenCalledTimes(1);
    expect(handlePagination).toHaveBeenCalledWith(paginationBodyWithKeyword, where);
    expect(removeOldProductAccessByVisitor).toHaveBeenCalledTimes(1);
    expect(removeOldProductAccessByVisitor).toHaveBeenCalledWith(user.user_id);
    expect(setProductAccessByVisitor).toHaveBeenCalledTimes(1);
    expect(setProductAccessByVisitor).toHaveBeenCalledWith(transactionResults[0], user.user_id);
  });

  it('product pagination for sale was success with categoryId', async () => {
    expect.hasAssertions();
    const paginationBodyWithCategoryId = {
      ...paginationBody,
      categoryId: product.category_id,
    };
    const setProductAccessByVisitor = jest
      .spyOn(productService as any, 'setProductAccessByVisitor')
      .mockResolvedValue(redisServiceResult);
    const removeOldProductAccessByVisitor = jest
      .spyOn(productService as any, 'removeOldProductAccessByVisitor')
      .mockResolvedValue(redisServiceResult);
    const handlePagination = jest
      .spyOn(productService as any, 'handlePagination')
      .mockResolvedValue(transactionResults);
    const payloadAssign = {
      ...payload,
      select: paginationBodyWithCategoryId,
    };
    const paginationServiceMethod = jest.spyOn(productService, 'paginationForSale');
    const paginationControllerMethod = jest.spyOn(productController, 'paginationForSale');
    await expect(productController.paginationForSale(payloadAssign)).resolves.toEqual({
      list: transactionResults[0],
      total: transactionResults[1],
    });
    expect(paginationControllerMethod).toHaveBeenCalledTimes(1);
    expect(paginationControllerMethod).toHaveBeenCalledWith(payloadAssign);
    expect(paginationServiceMethod).toHaveBeenCalledTimes(1);
    expect(paginationServiceMethod).toHaveBeenCalledWith(user.user_id, paginationBodyWithCategoryId);
    expect(handlePagination).toHaveBeenCalledTimes(1);
    expect(handlePagination).toHaveBeenCalledWith(paginationBodyWithCategoryId, where);
    expect(removeOldProductAccessByVisitor).toHaveBeenCalledTimes(1);
    expect(removeOldProductAccessByVisitor).toHaveBeenCalledWith(user.user_id);
    expect(setProductAccessByVisitor).toHaveBeenCalledTimes(1);
    expect(setProductAccessByVisitor).toHaveBeenCalledWith(transactionResults[0], user.user_id);
  });

  it('product pagination for sale was success with a both categoryId and keyword', async () => {
    expect.hasAssertions();
    const paginationBodyWithAllCondition = {
      ...paginationBody,
      categoryId: product.category_id,
      search: product.name,
    };
    const setProductAccessByVisitor = jest
      .spyOn(productService as any, 'setProductAccessByVisitor')
      .mockResolvedValue(redisServiceResult);
    const removeOldProductAccessByVisitor = jest
      .spyOn(productService as any, 'removeOldProductAccessByVisitor')
      .mockResolvedValue(redisServiceResult);
    const payloadAssign = {
      ...payload,
      select: paginationBodyWithAllCondition,
    };
    const handlePagination = jest
      .spyOn(productService as any, 'handlePagination')
      .mockResolvedValue(transactionResults);
    const paginationServiceMethod = jest.spyOn(productService, 'paginationForSale');
    const paginationControllerMethod = jest.spyOn(productController, 'paginationForSale');
    await expect(productController.paginationForSale(payloadAssign)).resolves.toEqual({
      list: transactionResults[0],
      total: transactionResults[1],
    });
    expect(paginationControllerMethod).toHaveBeenCalledTimes(1);
    expect(paginationControllerMethod).toHaveBeenCalledWith(payloadAssign);
    expect(paginationServiceMethod).toHaveBeenCalledTimes(1);
    expect(paginationServiceMethod).toHaveBeenCalledWith(user.user_id, paginationBodyWithAllCondition);
    expect(handlePagination).toHaveBeenCalledTimes(1);
    expect(handlePagination).toHaveBeenCalledWith(paginationBodyWithAllCondition, where);
    expect(removeOldProductAccessByVisitor).toHaveBeenCalledTimes(1);
    expect(removeOldProductAccessByVisitor).toHaveBeenCalledWith(user.user_id);
    expect(setProductAccessByVisitor).toHaveBeenCalledTimes(1);
    expect(setProductAccessByVisitor).toHaveBeenCalledWith(transactionResults[0], user.user_id);
  });

  it('product pagination for sale failed with not found error', async () => {
    expect.hasAssertions();
    const setProductAccessByVisitor = jest
      .spyOn(productService as any, 'setProductAccessByVisitor')
      .mockResolvedValue(redisServiceResult);
    const removeOldProductAccessByVisitor = jest
      .spyOn(productService as any, 'removeOldProductAccessByVisitor')
      .mockResolvedValue(redisServiceResult);
    const handlePagination = jest.spyOn(productService as any, 'handlePagination').mockResolvedValue([[], 0]);
    const paginationServiceMethod = jest.spyOn(productService, 'paginationForSale');
    const paginationControllerMethod = jest.spyOn(productController, 'paginationForSale');
    await expect(productController.paginationForSale(payload)).rejects.toThrow(
      new RpcException(
        new NotFoundException({
          list: [],
          total: 0,
        }),
      ),
    );
    expect(paginationControllerMethod).toHaveBeenCalledTimes(1);
    expect(paginationControllerMethod).toHaveBeenCalledWith(payload);
    expect(paginationServiceMethod).toHaveBeenCalledTimes(1);
    expect(paginationServiceMethod).toHaveBeenCalledWith(user.user_id, paginationBody);
    expect(handlePagination).toHaveBeenCalledTimes(1);
    expect(handlePagination).toHaveBeenCalledWith(paginationBody, where);
    expect(removeOldProductAccessByVisitor).toHaveBeenCalledTimes(1);
    expect(removeOldProductAccessByVisitor).toHaveBeenCalledWith(user.user_id);
    expect(setProductAccessByVisitor).toHaveBeenCalledTimes(1);
    expect(setProductAccessByVisitor).toHaveBeenCalledWith([], user.user_id);
  });

  it('product pagination for sale failed with unknown error', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const setProductAccessByVisitor = jest.spyOn(productService as any, 'setProductAccessByVisitor');
    const removeOldProductAccessByVisitor = jest.spyOn(productService as any, 'removeOldProductAccessByVisitor');
    const handlePagination = jest.spyOn(productService as any, 'handlePagination').mockRejectedValue(UnknownError);
    const paginationServiceMethod = jest.spyOn(productService, 'paginationForSale');
    const paginationControllerMethod = jest.spyOn(productController, 'paginationForSale');
    await expect(productController.paginationForSale(payload)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(messages.COMMON.COMMON_ERROR))),
    );
    expect(paginationControllerMethod).toHaveBeenCalledTimes(1);
    expect(paginationControllerMethod).toHaveBeenCalledWith(payload);
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(UnknownError.message, expect.any(String));
    expect(paginationServiceMethod).toHaveBeenCalledTimes(1);
    expect(paginationServiceMethod).toHaveBeenCalledWith(user.user_id, paginationBody);
    expect(handlePagination).toHaveBeenCalledTimes(1);
    expect(handlePagination).toHaveBeenCalledWith(paginationBody, where);
    expect(removeOldProductAccessByVisitor).not.toHaveBeenCalled();
    expect(setProductAccessByVisitor).not.toHaveBeenCalled();
  });

  it('product pagination for sale failed with removeOldProductAccessByVisitor got unknown error', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const setProductAccessByVisitor = jest
      .spyOn(productService as any, 'setProductAccessByVisitor')
      .mockResolvedValue(redisServiceResult);
    const removeOldProductAccessByVisitor = jest
      .spyOn(productService as any, 'removeOldProductAccessByVisitor')
      .mockRejectedValue(UnknownError);
    const handlePagination = jest
      .spyOn(productService as any, 'handlePagination')
      .mockResolvedValue(transactionResults);
    const paginationServiceMethod = jest.spyOn(productService, 'paginationForSale');
    const paginationControllerMethod = jest.spyOn(productController, 'paginationForSale');
    await expect(productController.paginationForSale(payload)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(messages.COMMON.COMMON_ERROR))),
    );
    expect(paginationControllerMethod).toHaveBeenCalledTimes(1);
    expect(paginationControllerMethod).toHaveBeenCalledWith(payload);
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(UnknownError.message, expect.any(String));
    expect(paginationServiceMethod).toHaveBeenCalledTimes(1);
    expect(paginationServiceMethod).toHaveBeenCalledWith(user.user_id, paginationBody);
    expect(handlePagination).toHaveBeenCalledTimes(1);
    expect(handlePagination).toHaveBeenCalledWith(paginationBody, where);
    expect(removeOldProductAccessByVisitor).toHaveBeenCalledTimes(1);
    expect(removeOldProductAccessByVisitor).toHaveBeenLastCalledWith(user.user_id);
    expect(setProductAccessByVisitor).not.toHaveBeenCalled();
  });

  it('product pagination for sale failed with setProductAccessByVisitor got unknown error', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const setProductAccessByVisitor = jest
      .spyOn(productService as any, 'setProductAccessByVisitor')
      .mockRejectedValue(UnknownError);
    const removeOldProductAccessByVisitor = jest
      .spyOn(productService as any, 'removeOldProductAccessByVisitor')
      .mockResolvedValue(redisServiceResult);
    const handlePagination = jest
      .spyOn(productService as any, 'handlePagination')
      .mockResolvedValue(transactionResults);
    const paginationServiceMethod = jest.spyOn(productService, 'paginationForSale');
    const paginationControllerMethod = jest.spyOn(productController, 'paginationForSale');
    await expect(productController.paginationForSale(payload)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(messages.COMMON.COMMON_ERROR))),
    );
    expect(paginationControllerMethod).toHaveBeenCalledTimes(1);
    expect(paginationControllerMethod).toHaveBeenCalledWith(payload);
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(UnknownError.message, expect.any(String));
    expect(paginationServiceMethod).toHaveBeenCalledTimes(1);
    expect(paginationServiceMethod).toHaveBeenCalledWith(user.user_id, paginationBody);
    expect(handlePagination).toHaveBeenCalledTimes(1);
    expect(handlePagination).toHaveBeenCalledWith(paginationBody, where);
    expect(removeOldProductAccessByVisitor).toHaveBeenCalledTimes(1);
    expect(removeOldProductAccessByVisitor).toHaveBeenLastCalledWith(user.user_id);
    expect(setProductAccessByVisitor).toHaveBeenCalledTimes(1);
    expect(setProductAccessByVisitor).toHaveBeenCalledWith(transactionResults[0], user.user_id);
  });

  it('product pagination for sale failed with database disconnect error', async () => {
    expect.hasAssertions();
    const setProductAccessByVisitor = jest.spyOn(productService as any, 'setProductAccessByVisitor');
    const removeOldProductAccessByVisitor = jest.spyOn(productService as any, 'removeOldProductAccessByVisitor');
    const logMethod = jest.spyOn(loggerService, 'error');
    const handlePagination = jest
      .spyOn(productService as any, 'handlePagination')
      .mockRejectedValue(PrismaDisconnectError);
    const paginationServiceMethod = jest.spyOn(productService, 'paginationForSale');
    const paginationControllerMethod = jest.spyOn(productController, 'paginationForSale');
    await expect(productController.paginationForSale(payload)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(PrismaDisconnectError.message))),
    );
    expect(paginationControllerMethod).toHaveBeenCalledTimes(1);
    expect(paginationControllerMethod).toHaveBeenCalledWith(payload);
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(PrismaDisconnectError.message, expect.any(String));
    expect(paginationServiceMethod).toHaveBeenCalledTimes(1);
    expect(paginationServiceMethod).toHaveBeenCalledWith(user.user_id, paginationBody);
    expect(handlePagination).toHaveBeenCalledTimes(1);
    expect(handlePagination).toHaveBeenCalledWith(paginationBody, where);
    expect(removeOldProductAccessByVisitor).not.toHaveBeenCalled();
    expect(setProductAccessByVisitor).not.toHaveBeenCalled();
  });
});

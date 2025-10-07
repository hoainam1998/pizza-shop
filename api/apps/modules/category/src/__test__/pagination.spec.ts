import { BadRequestException, NotFoundException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaClient } from 'generated/prisma';
import startUp from './pre-setup';
import CategoryController from '../category.controller';
import CategoryService from '../category.service';
import { createCategoryList } from '@share/test/pre-setup/mock/data/category';
import { PRISMA_CLIENT } from '@share/di-token';
import LoggingService from '@share/libs/logging/logging.service';
import { calcSkip, createMessage } from '@share/utils';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import messages from '@share/constants/messages';
import { PrismaDisconnectError } from '@share/test/pre-setup/mock/errors/prisma-errors';

let categoryController: CategoryController;
let categoryService: CategoryService;
let prismaService: PrismaClient;
let loggerService: LoggingService;

const query = {
  name: true,
  avatar: true,
  category_id: true,
};

const paginationBody = {
  pageSize: 10,
  pageNumber: 1,
  query,
};

beforeEach(async () => {
  const moduleRef = await startUp();

  categoryService = moduleRef.get(CategoryService);
  categoryController = moduleRef.get(CategoryController);
  loggerService = moduleRef.get(LoggingService);
  prismaService = moduleRef.get(PRISMA_CLIENT);
});

afterEach((done) => {
  jest.restoreAllMocks();
  jest.resetAllMocks();
  done();
});

describe('category pagination', () => {
  it('category pagination was success', async () => {
    expect.hasAssertions();
    const length = 2;
    const skip = calcSkip(paginationBody.pageSize, paginationBody.pageNumber);
    const categoryList = createCategoryList(length);
    const transactionResults = [categoryList, length];
    const findManyPrismaMethod = jest.spyOn(prismaService.category, 'findMany');
    const countPrismaMethod = jest.spyOn(prismaService.category, 'count');
    const transactionPrismaMethod = jest.spyOn(prismaService, '$transaction').mockResolvedValue(transactionResults);
    const paginationServiceMethod = jest.spyOn(categoryService, 'pagination');
    const paginationControllerMethod = jest.spyOn(categoryController, 'pagination');
    await expect(categoryController.pagination(paginationBody)).resolves.toEqual({
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
      select: {
        ...paginationBody.query,
        _count: {
          select: {
            product: true,
          },
        },
      },
      take: paginationBody.pageSize,
      skip,
      orderBy: {
        category_id: 'desc',
      },
    });
    expect(countPrismaMethod).toHaveBeenCalledTimes(1);
  });

  it('category pagination failed with not found error', async () => {
    expect.hasAssertions();
    const skip = calcSkip(paginationBody.pageSize, paginationBody.pageNumber);
    const findManyPrismaMethod = jest.spyOn(prismaService.category, 'findMany');
    const countPrismaMethod = jest.spyOn(prismaService.category, 'count');
    const transactionPrismaMethod = jest.spyOn(prismaService, '$transaction').mockResolvedValue([[], 0]);
    const paginationServiceMethod = jest.spyOn(categoryService, 'pagination');
    const paginationControllerMethod = jest.spyOn(categoryController, 'pagination');
    await expect(categoryController.pagination(paginationBody)).rejects.toThrow(
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
      select: {
        ...paginationBody.query,
        _count: {
          select: {
            product: true,
          },
        },
      },
      take: paginationBody.pageSize,
      skip,
      orderBy: {
        category_id: 'desc',
      },
    });
    expect(countPrismaMethod).toHaveBeenCalledTimes(1);
  });

  it('category pagination failed with unknown error', async () => {
    expect.hasAssertions();
    const skip = calcSkip(paginationBody.pageSize, paginationBody.pageNumber);
    const logMethod = jest.spyOn(loggerService, 'log');
    const findManyPrismaMethod = jest.spyOn(prismaService.category, 'findMany');
    const countPrismaMethod = jest.spyOn(prismaService.category, 'count');
    const transactionPrismaMethod = jest.spyOn(prismaService, '$transaction').mockRejectedValue(UnknownError);
    const paginationServiceMethod = jest.spyOn(categoryService, 'pagination');
    const paginationControllerMethod = jest.spyOn(categoryController, 'pagination');
    await expect(categoryController.pagination(paginationBody)).rejects.toThrow(
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
      select: {
        ...paginationBody.query,
        _count: {
          select: {
            product: true,
          },
        },
      },
      take: paginationBody.pageSize,
      skip,
      orderBy: {
        category_id: 'desc',
      },
    });
    expect(countPrismaMethod).toHaveBeenCalledTimes(1);
  });

  it('category pagination failed with database disconnect error', async () => {
    expect.hasAssertions();
    const skip = calcSkip(paginationBody.pageSize, paginationBody.pageNumber);
    const logMethod = jest.spyOn(loggerService, 'log');
    const findManyPrismaMethod = jest.spyOn(prismaService.category, 'findMany');
    const countPrismaMethod = jest.spyOn(prismaService.category, 'count');
    const transactionPrismaMethod = jest.spyOn(prismaService, '$transaction').mockRejectedValue(PrismaDisconnectError);
    const paginationServiceMethod = jest.spyOn(categoryService, 'pagination');
    const paginationControllerMethod = jest.spyOn(categoryController, 'pagination');
    await expect(categoryController.pagination(paginationBody)).rejects.toThrow(
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
      select: {
        ...paginationBody.query,
        _count: {
          select: {
            product: true,
          },
        },
      },
      take: paginationBody.pageSize,
      skip,
      orderBy: {
        category_id: 'desc',
      },
    });
    expect(countPrismaMethod).toHaveBeenCalledTimes(1);
  });
});

import { PrismaClient } from 'generated/prisma';
import startUp from './pre-setup';
import CategoryController from '../category.controller';
import CategoryService from '../category.service';
import { category } from '@share/test/pre-setup/mock/data/category';
import { PRISMA_CLIENT } from '@share/di-token';
import LoggingService from '@share/libs/logging/logging.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaDisconnectError, PrismaNotFoundError } from '@share/test/pre-setup/mock/errors/prisma-errors';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import messages from '@share/constants/messages';
import { createMessage } from '@share/utils';
delete category._count;

let categoryController: CategoryController;
let categoryService: CategoryService;
let prismaService: PrismaClient;
let loggerService: LoggingService;

const query = {
  name: true,
  avatar: true,
  category_id: true,
};

const getCategoryBody = {
  categoryId: category.category_id,
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

describe('get category', () => {
  it('get category was success', async () => {
    expect.hasAssertions();
    const findFirstOrThrowPrismaMethod = jest
      .spyOn(prismaService.category, 'findFirstOrThrow')
      .mockResolvedValue(category);
    const getDetailServiceMethod = jest.spyOn(categoryService, 'getDetail');
    const getAllControllerMethod = jest.spyOn(categoryController, 'getCategory');
    await expect(categoryController.getCategory(getCategoryBody)).resolves.toBe(category);
    expect(getAllControllerMethod).toHaveBeenCalledTimes(1);
    expect(getAllControllerMethod).toHaveBeenCalledWith(getCategoryBody);
    expect(getDetailServiceMethod).toHaveBeenCalledTimes(1);
    expect(getDetailServiceMethod).toHaveBeenCalledWith(getCategoryBody);
    expect(findFirstOrThrowPrismaMethod).toHaveBeenCalledTimes(1);
    expect(findFirstOrThrowPrismaMethod).toHaveBeenLastCalledWith({
      where: {
        category_id: getCategoryBody.categoryId,
      },
      select: getCategoryBody.query,
    });
  });

  it('get category failed with not found error', async () => {
    expect.hasAssertions();
    const findFirstOrThrowPrismaMethod = jest
      .spyOn(prismaService.category, 'findFirstOrThrow')
      .mockRejectedValue(PrismaNotFoundError);
    const logMethod = jest.spyOn(loggerService, 'log');
    const getDetailServiceMethod = jest.spyOn(categoryService, 'getDetail');
    const getAllControllerMethod = jest.spyOn(categoryController, 'getCategory');
    await expect(categoryController.getCategory(getCategoryBody)).rejects.toThrow(
      new RpcException(new NotFoundException(messages.CATEGORY.NOT_FOUND)),
    );
    expect(getAllControllerMethod).toHaveBeenCalledTimes(1);
    expect(getAllControllerMethod).toHaveBeenCalledWith(getCategoryBody);
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(messages.CATEGORY.NOT_FOUND, expect.any(String));
    expect(getDetailServiceMethod).toHaveBeenCalledTimes(1);
    expect(getDetailServiceMethod).toHaveBeenCalledWith(getCategoryBody);
    expect(findFirstOrThrowPrismaMethod).toHaveBeenCalledTimes(1);
    expect(findFirstOrThrowPrismaMethod).toHaveBeenLastCalledWith({
      where: {
        category_id: getCategoryBody.categoryId,
      },
      select: getCategoryBody.query,
    });
  });

  it('get category failed with unknown error', async () => {
    expect.hasAssertions();
    const findFirstOrThrowPrismaMethod = jest
      .spyOn(prismaService.category, 'findFirstOrThrow')
      .mockRejectedValue(UnknownError);
    const logMethod = jest.spyOn(loggerService, 'log');
    const getDetailServiceMethod = jest.spyOn(categoryService, 'getDetail');
    const getAllControllerMethod = jest.spyOn(categoryController, 'getCategory');
    await expect(categoryController.getCategory(getCategoryBody)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(messages.COMMON.COMMON_ERROR))),
    );
    expect(getAllControllerMethod).toHaveBeenCalledTimes(1);
    expect(getAllControllerMethod).toHaveBeenCalledWith(getCategoryBody);
    expect(logMethod).toHaveBeenCalledWith(UnknownError.message, expect.any(String));
    expect(getDetailServiceMethod).toHaveBeenCalledTimes(1);
    expect(getDetailServiceMethod).toHaveBeenCalledWith(getCategoryBody);
    expect(findFirstOrThrowPrismaMethod).toHaveBeenCalledTimes(1);
    expect(findFirstOrThrowPrismaMethod).toHaveBeenLastCalledWith({
      where: {
        category_id: getCategoryBody.categoryId,
      },
      select: getCategoryBody.query,
    });
  });

  it('get category failed with database disconnect error', async () => {
    expect.hasAssertions();
    const findFirstOrThrowPrismaMethod = jest
      .spyOn(prismaService.category, 'findFirstOrThrow')
      .mockRejectedValue(PrismaDisconnectError);
    const logMethod = jest.spyOn(loggerService, 'log');
    const getDetailServiceMethod = jest.spyOn(categoryService, 'getDetail');
    const getAllControllerMethod = jest.spyOn(categoryController, 'getCategory');
    await expect(categoryController.getCategory(getCategoryBody)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(PrismaDisconnectError.message))),
    );
    expect(getAllControllerMethod).toHaveBeenCalledTimes(1);
    expect(getAllControllerMethod).toHaveBeenCalledWith(getCategoryBody);
    expect(logMethod).toHaveBeenCalledWith(PrismaDisconnectError.message, expect.any(String));
    expect(getDetailServiceMethod).toHaveBeenCalledTimes(1);
    expect(getDetailServiceMethod).toHaveBeenCalledWith(getCategoryBody);
    expect(findFirstOrThrowPrismaMethod).toHaveBeenCalledTimes(1);
    expect(findFirstOrThrowPrismaMethod).toHaveBeenLastCalledWith({
      where: {
        category_id: getCategoryBody.categoryId,
      },
      select: getCategoryBody.query,
    });
  });
});

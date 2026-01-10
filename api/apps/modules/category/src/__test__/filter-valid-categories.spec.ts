import { RpcException } from '@nestjs/microservices';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaClient } from 'generated/prisma';
import startUp from './pre-setup';
import CategoryController from '../category.controller';
import CategoryService from '../category.service';
import { createCategoryList } from '@share/test/pre-setup/mock/data/category';
import { PRISMA_CLIENT } from '@share/di-token';
import LoggingService from '@share/libs/logging/logging.service';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import { createMessage } from '@share/utils';
import messages from '@share/constants/messages';
import { PrismaDisconnectError } from '@share/test/pre-setup/mock/errors/prisma-errors';
let categoryController: CategoryController;
let categoryService: CategoryService;
let prismaService: PrismaClient;
let loggerService: LoggingService;

const query: any = {
  name: true,
  avatar: true,
};
const categoryList = createCategoryList(2);

beforeEach(async () => {
  const moduleRef = await startUp();

  categoryService = moduleRef.get(CategoryService);
  categoryController = moduleRef.get(CategoryController);
  loggerService = moduleRef.get(LoggingService);
  prismaService = moduleRef.get(PRISMA_CLIENT);
});

describe('filter valid categories', () => {
  it('filter valid categories was success', async () => {
    expect.hasAssertions();
    const findManyPrismaMethod = jest.spyOn(prismaService.category, 'findMany').mockResolvedValue(categoryList);
    const filterValidCategoriesServiceMethod = jest.spyOn(categoryService, 'filterValidCategories');
    const filterValidCategoriesControllerMethod = jest.spyOn(categoryController, 'filterValidCategories');
    await categoryController.filterValidCategories(query);
    expect(filterValidCategoriesControllerMethod).toHaveBeenCalledTimes(1);
    expect(filterValidCategoriesControllerMethod).toHaveBeenCalledWith(query);
    expect(filterValidCategoriesServiceMethod).toHaveBeenCalledTimes(1);
    expect(filterValidCategoriesServiceMethod).toHaveBeenCalledWith(query);
    expect(findManyPrismaMethod).toHaveBeenCalledTimes(1);
    expect(findManyPrismaMethod).toHaveBeenCalledWith({
      select: query,
      where: {
        product: {
          some: {},
        },
      },
    });
  });

  it('filter valid categories failed when categories empty', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const findManyPrismaMethod = jest.spyOn(prismaService.category, 'findMany').mockResolvedValue([]);
    const filterValidCategoriesServiceMethod = jest.spyOn(categoryService, 'filterValidCategories');
    const filterValidCategoriesControllerMethod = jest.spyOn(categoryController, 'filterValidCategories');
    await expect(categoryController.filterValidCategories(query)).rejects.toThrow(
      new RpcException(new NotFoundException([])),
    );
    expect(filterValidCategoriesControllerMethod).toHaveBeenCalledTimes(1);
    expect(filterValidCategoriesControllerMethod).toHaveBeenCalledWith(query);
    expect(filterValidCategoriesServiceMethod).toHaveBeenCalledTimes(1);
    expect(filterValidCategoriesServiceMethod).toHaveBeenCalledWith(query);
    expect(findManyPrismaMethod).toHaveBeenCalledTimes(1);
    expect(findManyPrismaMethod).toHaveBeenCalledWith({
      select: query,
      where: {
        product: {
          some: {},
        },
      },
    });
    expect(logMethod).not.toHaveBeenCalled();
  });

  it('filter valid categories failed with unknown error', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const findManyPrismaMethod = jest.spyOn(prismaService.category, 'findMany').mockRejectedValue(UnknownError);
    const filterValidCategoriesServiceMethod = jest.spyOn(categoryService, 'filterValidCategories');
    const filterValidCategoriesControllerMethod = jest.spyOn(categoryController, 'filterValidCategories');
    await expect(categoryController.filterValidCategories(query)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(messages.COMMON.COMMON_ERROR))),
    );
    expect(filterValidCategoriesControllerMethod).toHaveBeenCalledTimes(1);
    expect(filterValidCategoriesControllerMethod).toHaveBeenCalledWith(query);
    expect(filterValidCategoriesServiceMethod).toHaveBeenCalledTimes(1);
    expect(filterValidCategoriesServiceMethod).toHaveBeenCalledWith(query);
    expect(findManyPrismaMethod).toHaveBeenCalledTimes(1);
    expect(findManyPrismaMethod).toHaveBeenCalledWith({
      select: query,
      where: {
        product: {
          some: {},
        },
      },
    });
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(UnknownError.message, expect.any(String));
  });

  it('filter valid categories failed with database disconnect error', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const findManyPrismaMethod = jest
      .spyOn(prismaService.category, 'findMany')
      .mockRejectedValue(PrismaDisconnectError);
    const filterValidCategoriesServiceMethod = jest.spyOn(categoryService, 'filterValidCategories');
    const filterValidCategoriesControllerMethod = jest.spyOn(categoryController, 'filterValidCategories');
    await expect(categoryController.filterValidCategories(query)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(PrismaDisconnectError.message))),
    );
    expect(filterValidCategoriesControllerMethod).toHaveBeenCalledTimes(1);
    expect(filterValidCategoriesControllerMethod).toHaveBeenCalledWith(query);
    expect(filterValidCategoriesServiceMethod).toHaveBeenCalledTimes(1);
    expect(filterValidCategoriesServiceMethod).toHaveBeenCalledWith(query);
    expect(findManyPrismaMethod).toHaveBeenCalledTimes(1);
    expect(findManyPrismaMethod).toHaveBeenCalledWith({
      select: query,
      where: {
        product: {
          some: {},
        },
      },
    });
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(PrismaDisconnectError.message, expect.any(String));
  });
});

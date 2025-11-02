import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaClient } from 'generated/prisma';
import { RpcException } from '@nestjs/microservices';
import startUp from './pre-setup';
import CategoryController from '../category.controller';
import CategoryService from '../category.service';
import { category, createCategoryList } from '@share/test/pre-setup/mock/data/category';
import { PRISMA_CLIENT } from '@share/di-token';
import LoggingService from '@share/libs/logging/logging.service';
import messages from '@share/constants/messages';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import { createMessage } from '@share/utils';
import { PrismaDisconnectError, PrismaNotFoundError } from '@share/test/pre-setup/mock/errors/prisma-errors';
import CategoryCachingService from '@share/libs/caching/category/category.service';
delete category._count;

let categoryController: CategoryController;
let categoryService: CategoryService;
let prismaService: PrismaClient;
let loggerService: LoggingService;
let categoryCachingService: CategoryCachingService;

beforeEach(async () => {
  const moduleRef = await startUp();

  categoryService = moduleRef.get(CategoryService);
  categoryController = moduleRef.get(CategoryController);
  loggerService = moduleRef.get(LoggingService);
  prismaService = moduleRef.get(PRISMA_CLIENT);
  categoryCachingService = moduleRef.get(CategoryCachingService);
});

describe('delete category', () => {
  it('delete category was success', async () => {
    expect.hasAssertions();
    const updatePrismaMethod = jest.spyOn(prismaService.category, 'update');
    const deletePrismaMethod = jest.spyOn(prismaService.category, 'delete');
    const transactionPrismaMethod = jest.spyOn(prismaService, '$transaction').mockResolvedValue(createCategoryList(2));
    const deleteMethodService = jest.spyOn(categoryService, 'delete');
    const deleteCacheCategoriesMethod = jest.spyOn(categoryCachingService, 'deleteAllCategories');
    const deleteCategoryControllerMethod = jest.spyOn(categoryController, 'deleteCategory');
    await expect(categoryController.deleteCategory(category.category_id)).resolves.toBe(category);
    expect(deleteCategoryControllerMethod).toHaveBeenCalledTimes(1);
    expect(deleteCategoryControllerMethod).toHaveBeenCalledWith(category.category_id);
    expect(transactionPrismaMethod).toHaveBeenCalledTimes(1);
    expect(transactionPrismaMethod).toHaveBeenLastCalledWith(expect.any(Array));
    expect(deleteMethodService).toHaveBeenCalledTimes(1);
    expect(deleteMethodService).toHaveBeenCalledWith(category.category_id);
    expect(deleteCacheCategoriesMethod).toHaveBeenCalledTimes(1);
    expect(updatePrismaMethod).toHaveBeenCalledTimes(1);
    expect(updatePrismaMethod).toHaveBeenCalledWith({
      where: {
        category_id: category.category_id,
      },
      data: {
        product: {
          deleteMany: {},
        },
      },
    });
    expect(deletePrismaMethod).toHaveBeenCalledTimes(1);
    expect(deletePrismaMethod).toHaveBeenCalledWith({
      where: {
        category_id: category.category_id,
      },
    });
  });

  it('delete category failed with item not found error', async () => {
    expect.hasAssertions();
    const updatePrismaMethod = jest.spyOn(prismaService.category, 'update');
    const deletePrismaMethod = jest.spyOn(prismaService.category, 'delete');
    const transactionPrismaMethod = jest.spyOn(prismaService, '$transaction').mockRejectedValue(PrismaNotFoundError);
    const deleteMethodService = jest.spyOn(categoryService, 'delete');
    const deleteCacheCategoriesMethod = jest.spyOn(categoryCachingService, 'deleteAllCategories');
    const deleteMethodController = jest.spyOn(categoryController, 'deleteCategory');
    const logMethod = jest.spyOn(loggerService, 'error');
    await expect(categoryController.deleteCategory(category.category_id)).rejects.toThrow(
      new RpcException(new NotFoundException(messages.CATEGORY.NOT_FOUND)),
    );
    expect(deleteMethodController).toHaveBeenCalledTimes(1);
    expect(deleteMethodController).toHaveBeenCalledWith(category.category_id);
    expect(logMethod).toHaveBeenCalled();
    expect(logMethod).toHaveBeenCalledWith(messages.CATEGORY.NOT_FOUND, expect.any(String));
    expect(transactionPrismaMethod).toHaveBeenCalledTimes(1);
    expect(transactionPrismaMethod).toHaveBeenCalledWith(expect.any(Array));
    expect(deleteMethodService).toHaveBeenCalledTimes(1);
    expect(deleteMethodService).toHaveBeenCalledWith(category.category_id);
    expect(deleteCacheCategoriesMethod).not.toHaveBeenCalled();
    expect(updatePrismaMethod).toHaveBeenCalledTimes(1);
    expect(updatePrismaMethod).toHaveBeenCalledWith({
      where: {
        category_id: category.category_id,
      },
      data: {
        product: {
          deleteMany: {},
        },
      },
    });
    expect(deletePrismaMethod).toHaveBeenCalledTimes(1);
    expect(deletePrismaMethod).toHaveBeenCalledWith({
      where: {
        category_id: category.category_id,
      },
    });
  });

  it('delete category failed with unknown error', async () => {
    expect.hasAssertions();
    const updatePrismaMethod = jest.spyOn(prismaService.category, 'update');
    const deletePrismaMethod = jest.spyOn(prismaService.category, 'delete');
    const transactionPrismaMethod = jest.spyOn(prismaService, '$transaction').mockRejectedValue(UnknownError);
    const deleteMethodService = jest.spyOn(categoryService, 'delete');
    const deleteCacheCategoriesMethod = jest.spyOn(categoryCachingService, 'deleteAllCategories');
    const deleteMethodController = jest.spyOn(categoryController, 'deleteCategory');
    const logMethod = jest.spyOn(loggerService, 'error');
    await expect(categoryController.deleteCategory(category.category_id)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(messages.COMMON.COMMON_ERROR))),
    );
    expect(deleteMethodController).toHaveBeenCalledTimes(1);
    expect(deleteMethodController).toHaveBeenCalledWith(category.category_id);
    expect(logMethod).toHaveBeenCalled();
    expect(logMethod).toHaveBeenCalledWith(UnknownError.message, expect.any(String));
    expect(transactionPrismaMethod).toHaveBeenCalledTimes(1);
    expect(transactionPrismaMethod).toHaveBeenCalledWith(expect.any(Array));
    expect(deleteMethodService).toHaveBeenCalledTimes(1);
    expect(deleteMethodService).toHaveBeenCalledWith(category.category_id);
    expect(deleteCacheCategoriesMethod).not.toHaveBeenCalled();
    expect(updatePrismaMethod).toHaveBeenCalledTimes(1);
    expect(updatePrismaMethod).toHaveBeenCalledWith({
      where: {
        category_id: category.category_id,
      },
      data: {
        product: {
          deleteMany: {},
        },
      },
    });
    expect(deletePrismaMethod).toHaveBeenCalledTimes(1);
    expect(deletePrismaMethod).toHaveBeenCalledWith({
      where: {
        category_id: category.category_id,
      },
    });
  });

  it('delete category failed with database disconnect error', async () => {
    expect.hasAssertions();
    const updatePrismaMethod = jest.spyOn(prismaService.category, 'update');
    const deletePrismaMethod = jest.spyOn(prismaService.category, 'delete');
    const transactionPrismaMethod = jest.spyOn(prismaService, '$transaction').mockRejectedValue(PrismaDisconnectError);
    const deleteMethodService = jest.spyOn(categoryService, 'delete');
    const deleteCacheCategoriesMethod = jest.spyOn(categoryCachingService, 'deleteAllCategories');
    const deleteMethodController = jest.spyOn(categoryController, 'deleteCategory');
    const logMethod = jest.spyOn(loggerService, 'error');
    await expect(categoryController.deleteCategory(category.category_id)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(PrismaDisconnectError.message))),
    );
    expect(deleteMethodController).toHaveBeenCalledTimes(1);
    expect(deleteMethodController).toHaveBeenCalledWith(category.category_id);
    expect(logMethod).toHaveBeenCalled();
    expect(logMethod).toHaveBeenCalledWith(PrismaDisconnectError.message, expect.any(String));
    expect(transactionPrismaMethod).toHaveBeenCalledTimes(1);
    expect(transactionPrismaMethod).toHaveBeenCalledWith(expect.any(Array));
    expect(deleteMethodService).toHaveBeenCalledTimes(1);
    expect(deleteMethodService).toHaveBeenCalledWith(category.category_id);
    expect(deleteCacheCategoriesMethod).not.toHaveBeenCalled();
    expect(updatePrismaMethod).toHaveBeenCalledTimes(1);
    expect(updatePrismaMethod).toHaveBeenCalledWith({
      where: {
        category_id: category.category_id,
      },
      data: {
        product: {
          deleteMany: {},
        },
      },
    });
    expect(deletePrismaMethod).toHaveBeenCalledTimes(1);
    expect(deletePrismaMethod).toHaveBeenCalledWith({
      where: {
        category_id: category.category_id,
      },
    });
  });
});

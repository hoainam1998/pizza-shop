import { PrismaClient } from 'generated/prisma';
import { RpcException } from '@nestjs/microservices';
import { PrismaDisconnectError, PrismaNotFoundError } from '@share/test/pre-setup/mock/errors/prisma-errors';
import startUp from './pre-setup';
import CategoryController from '../category.controller';
import CategoryService from '../category.service';
import CategoryCachingService from '@share/libs/caching/category/category.service';
import { category } from '@share/test/pre-setup/mock/data/category';
import { PRISMA_CLIENT } from '@share/di-token';
import LoggingService from '@share/libs/logging/logging.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import messages from '@share/constants/messages';
import { createMessage } from '@share/utils';
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

describe('update category', () => {
  it('update category was success', async () => {
    expect.hasAssertions();
    const updatePrismaMethod = jest.spyOn(prismaService.category, 'update').mockResolvedValue(category);
    const updateMethodService = jest.spyOn(categoryService, 'update');
    const deleteCacheCategoriesMethod = jest.spyOn(categoryCachingService, 'deleteAllCategories');
    const updateCategoryControllerMethod = jest.spyOn(categoryController, 'updateCategory');
    await expect(categoryController.updateCategory(category)).resolves.toBe(category);
    expect(updateCategoryControllerMethod).toHaveBeenCalledTimes(1);
    expect(updateCategoryControllerMethod).toHaveBeenCalledWith(category);
    expect(updateMethodService).toHaveBeenCalledTimes(1);
    expect(updateMethodService).toHaveBeenCalledWith(category);
    expect(deleteCacheCategoriesMethod).toHaveBeenCalledTimes(1);
    expect(updatePrismaMethod).toHaveBeenCalledTimes(1);
    expect(updatePrismaMethod).toHaveBeenCalledWith({
      where: {
        category_id: category.category_id,
      },
      data: {
        name: category.name,
        avatar: category.avatar,
      },
    });
  });

  it('update category failed with item not found error', async () => {
    expect.hasAssertions();
    const updatePrismaMethod = jest.spyOn(prismaService.category, 'update').mockRejectedValue(PrismaNotFoundError);
    const updateMethodService = jest.spyOn(categoryService, 'update');
    const deleteCacheCategoriesMethod = jest.spyOn(categoryCachingService, 'deleteAllCategories');
    const updateMethodController = jest.spyOn(categoryController, 'updateCategory');
    const logMethod = jest.spyOn(loggerService, 'error');
    await expect(categoryController.updateCategory(category)).rejects.toThrow(
      new RpcException(new NotFoundException(messages.CATEGORY.NOT_FOUND)),
    );
    expect(updateMethodController).toHaveBeenCalledTimes(1);
    expect(updateMethodController).toHaveBeenCalledWith(category);
    expect(logMethod).toHaveBeenCalled();
    expect(logMethod).toHaveBeenCalledWith(messages.CATEGORY.NOT_FOUND, expect.any(String));
    expect(updateMethodService).toHaveBeenCalledTimes(1);
    expect(updateMethodService).toHaveBeenCalledWith(category);
    expect(deleteCacheCategoriesMethod).not.toHaveBeenCalled();
    expect(updatePrismaMethod).toHaveBeenCalledTimes(1);
    expect(updatePrismaMethod).toHaveBeenCalledWith({
      where: {
        category_id: category.category_id,
      },
      data: {
        name: category.name,
        avatar: category.avatar,
      },
    });
  });

  it('update category failed with unknown error', async () => {
    expect.hasAssertions();
    const updatePrismaMethod = jest.spyOn(prismaService.category, 'update').mockRejectedValue(UnknownError);
    const updateMethodService = jest.spyOn(categoryService, 'update');
    const deleteCacheCategoriesMethod = jest.spyOn(categoryCachingService, 'deleteAllCategories');
    const updateMethodController = jest.spyOn(categoryController, 'updateCategory');
    const logMethod = jest.spyOn(loggerService, 'error');
    await expect(categoryController.updateCategory(category)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(messages.COMMON.COMMON_ERROR))),
    );
    expect(updateMethodController).toHaveBeenCalledTimes(1);
    expect(updateMethodController).toHaveBeenCalledWith(category);
    expect(logMethod).toHaveBeenCalled();
    expect(logMethod).toHaveBeenCalledWith(UnknownError.message, expect.any(String));
    expect(updateMethodService).toHaveBeenCalledTimes(1);
    expect(updateMethodService).toHaveBeenCalledWith(category);
    expect(deleteCacheCategoriesMethod).not.toHaveBeenCalled();
    expect(updatePrismaMethod).toHaveBeenCalled();
    expect(updatePrismaMethod).toHaveBeenCalledWith({
      where: {
        category_id: category.category_id,
      },
      data: {
        name: category.name,
        avatar: category.avatar,
      },
    });
  });

  it('update category failed with database disconnect error', async () => {
    expect.hasAssertions();
    const updatePrismaMethod = jest.spyOn(prismaService.category, 'update').mockRejectedValue(PrismaDisconnectError);
    const updateMethodService = jest.spyOn(categoryService, 'update');
    const deleteCacheCategoriesMethod = jest.spyOn(categoryCachingService, 'deleteAllCategories');
    const updateMethodController = jest.spyOn(categoryController, 'updateCategory');
    const logMethod = jest.spyOn(loggerService, 'error');
    await expect(categoryController.updateCategory(category)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(PrismaDisconnectError.message))),
    );
    expect(updateMethodController).toHaveBeenCalledTimes(1);
    expect(updateMethodController).toHaveBeenCalledWith(category);
    expect(logMethod).toHaveBeenCalled();
    expect(logMethod).toHaveBeenCalledWith(PrismaDisconnectError.message, expect.any(String));
    expect(updateMethodService).toHaveBeenCalledTimes(1);
    expect(updateMethodService).toHaveBeenCalledWith(category);
    expect(deleteCacheCategoriesMethod).not.toHaveBeenCalled();
    expect(updatePrismaMethod).toHaveBeenCalled();
    expect(updatePrismaMethod).toHaveBeenCalledWith({
      where: {
        category_id: category.category_id,
      },
      data: {
        name: category.name,
        avatar: category.avatar,
      },
    });
  });
});

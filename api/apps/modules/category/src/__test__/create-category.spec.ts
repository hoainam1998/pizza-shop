import { PrismaClient } from 'generated/prisma';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import { PrismaDisconnectError } from '@share/test/pre-setup/mock/errors/prisma-errors';
import { RpcException } from '@nestjs/microservices';
import startUp from './pre-setup';
import CategoryController from '../category.controller';
import CategoryService from '../category.service';
import { category } from '@share/test/pre-setup/mock/data/category';
import { PRISMA_CLIENT } from '@share/di-token';
import LoggingService from '@share/libs/logging/logging.service';
import { BadRequestException } from '@nestjs/common';
import { createMessage } from '@share/utils';
import messages from '@share/constants/messages';
delete category._count;

let categoryController: CategoryController;
let categoryService: CategoryService;
let prismaService: PrismaClient;
let loggerService: LoggingService;

beforeEach(async () => {
  const moduleRef = await startUp();

  categoryService = moduleRef.get(CategoryService);
  categoryController = moduleRef.get(CategoryController);
  loggerService = moduleRef.get(LoggingService);
  prismaService = moduleRef.get(PRISMA_CLIENT);
});

describe('create category', () => {
  it('create category was success', async () => {
    expect.hasAssertions();
    const createPrismaMethod = jest.spyOn(prismaService.category, 'create').mockResolvedValue(category);
    const createMethodService = jest.spyOn(categoryService, 'create');
    const storeCacheCategoriesMethod = jest.spyOn(categoryService as any, 'storeCacheCategories');
    const createMethodController = jest.spyOn(categoryController, 'createCategory');
    await expect(categoryController.createCategory(category)).resolves.toBe(category);
    expect(createMethodController).toHaveBeenCalled();
    expect(createMethodController).toHaveBeenCalledWith(category);
    expect(createMethodService).toHaveBeenCalled();
    expect(createMethodService).toHaveBeenCalledWith(category);
    expect(storeCacheCategoriesMethod).toHaveBeenCalledTimes(1);
    expect(createPrismaMethod).toHaveBeenCalled();
    expect(createPrismaMethod).toHaveBeenCalledWith({
      data: {
        category_id: expect.stringMatching(/(\d+){13}/),
        name: category.name,
        avatar: category.avatar,
      },
    });
  });

  it('create category failed with unknown error', async () => {
    expect.hasAssertions();
    const storeCacheCategoriesMethod = jest.spyOn(categoryService as any, 'storeCacheCategories');
    const createPrismaMethod = jest.spyOn(prismaService.category, 'create').mockRejectedValue(UnknownError);
    const createMethodService = jest.spyOn(categoryService, 'create');
    const createMethodController = jest.spyOn(categoryController, 'createCategory');
    const logMethod = jest.spyOn(loggerService, 'log');
    await expect(categoryController.createCategory(category)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(messages.COMMON.COMMON_ERROR))),
    );
    expect(createMethodController).toHaveBeenCalled();
    expect(createMethodController).toHaveBeenCalledWith(category);
    expect(logMethod).toHaveBeenCalled();
    expect(logMethod).toHaveBeenCalledWith(UnknownError.message, expect.any(String));
    expect(createMethodService).toHaveBeenCalled();
    expect(createMethodService).toHaveBeenCalledWith(category);
    expect(storeCacheCategoriesMethod).not.toHaveBeenCalled();
    expect(createPrismaMethod).toHaveBeenCalled();
    expect(createPrismaMethod).toHaveBeenCalledWith({
      data: {
        category_id: expect.stringMatching(/(\d){13}/),
        name: category.name,
        avatar: category.avatar,
      },
    });
  });

  it('create category failed with database disconnect error', async () => {
    expect.hasAssertions();
    const storeCacheCategoriesMethod = jest.spyOn(categoryService as any, 'storeCacheCategories');
    const createPrismaMethod = jest.spyOn(prismaService.category, 'create').mockRejectedValue(PrismaDisconnectError);
    const createMethodService = jest.spyOn(categoryService, 'create');
    const createMethodController = jest.spyOn(categoryController, 'createCategory');
    const logMethod = jest.spyOn(loggerService, 'log');
    await expect(categoryController.createCategory(category)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(PrismaDisconnectError.message))),
    );
    expect(createMethodController).toHaveBeenCalled();
    expect(createMethodController).toHaveBeenCalledWith(category);
    expect(logMethod).toHaveBeenCalled();
    expect(logMethod).toHaveBeenCalledWith(PrismaDisconnectError.message, expect.any(String));
    expect(createMethodService).toHaveBeenCalled();
    expect(createMethodService).toHaveBeenCalledWith(category);
    expect(storeCacheCategoriesMethod).not.toHaveBeenCalled();
    expect(createPrismaMethod).toHaveBeenCalled();
    expect(createPrismaMethod).toHaveBeenCalledWith({
      data: {
        category_id: expect.stringMatching(/(\d){13}/),
        name: category.name,
        avatar: category.avatar,
      },
    });
  });
});

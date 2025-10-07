import { PrismaClient } from 'generated/prisma';
import startUp from './pre-setup';
import CategoryController from '../category.controller';
import CategoryService from '../category.service';
import { createCategoryList } from '@share/test/pre-setup/mock/data/category';
import { PRISMA_CLIENT } from '@share/di-token';
import LoggingService from '@share/libs/logging/logging.service';
import CategoryCachingService from '@share/libs/caching/category/category.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import { createMessage } from '@share/utils';
import messages from '@share/constants/messages';
let categoryController: CategoryController;
let categoryService: CategoryService;
let prismaService: PrismaClient;
let categoryCachingService: CategoryCachingService;
let loggerService: LoggingService;

const query = {
  name: true,
  avatar: true,
};

beforeEach(async () => {
  const moduleRef = await startUp();

  categoryService = moduleRef.get(CategoryService);
  categoryController = moduleRef.get(CategoryController);
  loggerService = moduleRef.get(LoggingService);
  prismaService = moduleRef.get(PRISMA_CLIENT);
  categoryCachingService = moduleRef.get(CategoryCachingService);
});

afterEach((done) => {
  jest.restoreAllMocks();
  jest.resetAllMocks();
  done();
});

describe('get all categories', () => {
  it('get all categories was success with have not caching data', async () => {
    expect.hasAssertions();
    const categoryList = createCategoryList(2);
    const checkExistMethod = jest.spyOn(categoryCachingService, 'checkExist').mockResolvedValue(false);
    const storeRedisCache = jest.spyOn(categoryCachingService, 'storeAllCategories');
    const findManyPrismaMethod = jest.spyOn(prismaService.category, 'findMany').mockResolvedValue(categoryList);
    const getAllServiceMethod = jest.spyOn(categoryService, 'getAllCategories');
    const getAllControllerMethod = jest.spyOn(categoryController, 'getAllCategories');
    await categoryController.getAllCategories(query);
    expect(getAllControllerMethod).toHaveBeenCalledTimes(1);
    expect(getAllControllerMethod).toHaveBeenCalledWith(query);
    expect(getAllServiceMethod).toHaveBeenCalledTimes(1);
    expect(getAllServiceMethod).toHaveBeenCalledWith(query);
    expect(checkExistMethod).toHaveBeenCalledTimes(1);
    expect(findManyPrismaMethod).toHaveBeenCalledTimes(1);
    expect(storeRedisCache).toHaveBeenCalledTimes(1);
    expect(storeRedisCache).toHaveBeenCalledWith(categoryList);
  });

  it('get all categories was success when caching data have exist', async () => {
    expect.hasAssertions();
    const categoryList = createCategoryList(2);
    const checkExistMethod = jest.spyOn(categoryCachingService, 'checkExist').mockResolvedValue(true);
    const getAllCategoriesCache = jest
      .spyOn(categoryCachingService, 'getAllCategories')
      .mockResolvedValue(categoryList);
    const findManyPrismaMethod = jest.spyOn(prismaService.category, 'findMany').mockResolvedValue(categoryList);
    const getAllServiceMethod = jest.spyOn(categoryService, 'getAllCategories');
    const getAllControllerMethod = jest.spyOn(categoryController, 'getAllCategories');
    await categoryController.getAllCategories(query);
    expect(getAllControllerMethod).toHaveBeenCalledTimes(1);
    expect(getAllControllerMethod).toHaveBeenCalledWith(query);
    expect(getAllServiceMethod).toHaveBeenCalledTimes(1);
    expect(getAllServiceMethod).toHaveBeenCalledWith(query);
    expect(checkExistMethod).toHaveBeenCalledTimes(1);
    expect(findManyPrismaMethod).not.toHaveBeenCalled();
    expect(getAllCategoriesCache).toHaveBeenCalledTimes(1);
    await expect(getAllCategoriesCache.mock.results[0].value).resolves.toBe(categoryList);
  });

  it('get all categories failed when categories empty', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'log');
    const getAllServiceMethod = jest.spyOn(categoryService, 'getAllCategories').mockResolvedValue([]);
    const getAllControllerMethod = jest.spyOn(categoryController, 'getAllCategories');
    await expect(categoryController.getAllCategories(query)).rejects.toThrow(
      new RpcException(
        new NotFoundException({
          message: [],
        }),
      ),
    );
    expect(getAllControllerMethod).toHaveBeenCalledTimes(1);
    expect(getAllControllerMethod).toHaveBeenCalledWith(query);
    expect(getAllServiceMethod).toHaveBeenCalledTimes(1);
    expect(getAllServiceMethod).toHaveBeenCalledWith(query);
    expect(logMethod).not.toHaveBeenCalled();
  });

  it('get all categories failed with unknown error', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'log');
    const getAllServiceMethod = jest.spyOn(categoryService, 'getAllCategories').mockRejectedValue(UnknownError);
    const getAllControllerMethod = jest.spyOn(categoryController, 'getAllCategories');
    await expect(categoryController.getAllCategories(query)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(messages.COMMON.COMMON_ERROR))),
    );
    expect(getAllControllerMethod).toHaveBeenCalledTimes(1);
    expect(getAllControllerMethod).toHaveBeenCalledWith(query);
    expect(getAllServiceMethod).toHaveBeenCalledTimes(1);
    expect(getAllServiceMethod).toHaveBeenCalledWith(query);
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(UnknownError.message, expect.any(String));
  });
});

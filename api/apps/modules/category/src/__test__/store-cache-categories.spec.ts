import startUp from './pre-setup';
import CategoryService from '../category.service';
import { PRISMA_CLIENT } from '@share/di-token';
import { PrismaClient } from 'generated/prisma';
import { createCategoryList } from '@share/test/pre-setup/mock/data/category';
import CategoryCachingService from '@share/libs/caching/category/category.service';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import { PrismaDisconnectError } from '@share/test/pre-setup/mock/errors/prisma-errors';
let categoryService: CategoryService;
let categoryCachingService: CategoryCachingService;
let prismaService: PrismaClient;

beforeEach(async () => {
  const moduleRef = await startUp();
  categoryService = moduleRef.get(CategoryService);
  categoryCachingService = moduleRef.get(CategoryCachingService);
  prismaService = moduleRef.get(PRISMA_CLIENT);
});

describe('store cache categories', () => {
  it('store cache success', async () => {
    expect.hasAssertions();
    const categories = createCategoryList(2);
    const findManyMethod = jest.spyOn(prismaService.category, 'findMany').mockResolvedValue(categories);
    const storeAllCategoriesCachingServiceMethod = jest.spyOn(categoryCachingService, 'storeAllCategories');
    const storeCacheCategoriesServiceMethod = jest.spyOn(categoryService as any, 'storeCacheCategories');
    await expect((categoryService as any).storeCacheCategories()).resolves.toBe(categories);
    expect(storeCacheCategoriesServiceMethod).toHaveBeenCalledTimes(1);
    expect(findManyMethod).toHaveBeenCalledTimes(1);
    expect(storeAllCategoriesCachingServiceMethod).toHaveBeenCalledTimes(1);
    expect(storeAllCategoriesCachingServiceMethod).toHaveBeenLastCalledWith(categories);
  });

  it('store cache failed with findMany got unknown error', async () => {
    expect.hasAssertions();
    const findManyMethod = jest.spyOn(prismaService.category, 'findMany').mockRejectedValue(UnknownError);
    const storeAllCategoriesCachingServiceMethod = jest.spyOn(categoryCachingService, 'storeAllCategories');
    const storeCacheCategoriesServiceMethod = jest.spyOn(categoryService as any, 'storeCacheCategories');
    await expect((categoryService as any).storeCacheCategories()).rejects.toThrow(UnknownError);
    expect(storeCacheCategoriesServiceMethod).toHaveBeenCalledTimes(1);
    expect(findManyMethod).toHaveBeenCalledTimes(1);
    expect(storeAllCategoriesCachingServiceMethod).not.toHaveBeenCalled();
  });

  it('store cache failed with storeAllCategories service method got unknown error', async () => {
    expect.hasAssertions();
    const categories = createCategoryList(2);
    const findManyMethod = jest.spyOn(prismaService.category, 'findMany').mockResolvedValue(categories);
    const storeAllCategoriesCachingServiceMethod = jest
      .spyOn(categoryCachingService, 'storeAllCategories')
      .mockRejectedValue(UnknownError);
    const storeCacheCategoriesServiceMethod = jest.spyOn(categoryService as any, 'storeCacheCategories');
    await expect((categoryService as any).storeCacheCategories()).rejects.toThrow(UnknownError);
    expect(storeCacheCategoriesServiceMethod).toHaveBeenCalledTimes(1);
    expect(findManyMethod).toHaveBeenCalledTimes(1);
    expect(storeAllCategoriesCachingServiceMethod).toHaveBeenCalledTimes(1);
    expect(storeAllCategoriesCachingServiceMethod).toHaveBeenLastCalledWith(categories);
  });

  it('store cache failed with findMany got database disconnect error', async () => {
    expect.hasAssertions();
    const findManyMethod = jest.spyOn(prismaService.category, 'findMany').mockRejectedValue(PrismaDisconnectError);
    const storeAllCategoriesCachingServiceMethod = jest.spyOn(categoryCachingService, 'storeAllCategories');
    const storeCacheCategoriesServiceMethod = jest.spyOn(categoryService as any, 'storeCacheCategories');
    await expect((categoryService as any).storeCacheCategories()).rejects.toThrow(PrismaDisconnectError);
    expect(storeCacheCategoriesServiceMethod).toHaveBeenCalledTimes(1);
    expect(findManyMethod).toHaveBeenCalledTimes(1);
    expect(storeAllCategoriesCachingServiceMethod).not.toHaveBeenCalled();
  });
});

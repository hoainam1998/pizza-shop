import { PrismaClient, Status } from 'generated/prisma';
import startUp from './pre-setup';
import ProductService from '../product.service';
import { product, createProductList } from '@share/test/pre-setup/mock/data/product';
import { PRISMA_CLIENT } from '@share/di-token';
import { calcSkip } from '@share/utils';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import { PrismaDisconnectError, PrismaNotFoundError } from '@share/test/pre-setup/mock/errors/prisma-errors';

let productService: ProductService;
let prismaService: PrismaClient;
const length = 2;
const productList = createProductList(length);

const query = {
  name: true,
  avatar: true,
  count: true,
  price: true,
};

const paginationBody: any = {
  pageSize: 10,
  pageNumber: 1,
  query,
};

const where = {
  status: Status.IN_STOCK,
};

beforeEach(async () => {
  const moduleRef = await startUp();

  productService = moduleRef.get(ProductService);
  prismaService = moduleRef.get(PRISMA_CLIENT);
});

describe('handle pagination', () => {
  it('handle pagination was success', async () => {
    expect.hasAssertions();
    const skip = calcSkip(paginationBody.pageSize, paginationBody.pageNumber);
    const transactionResults = [productList, length];
    const findManyPrismaMethod = jest.spyOn(prismaService.product, 'findMany');
    const countPrismaMethod = jest.spyOn(prismaService.product, 'count');
    const transactionPrismaMethod = jest.spyOn(prismaService, '$transaction').mockResolvedValue(transactionResults);
    const handlePagination = jest.spyOn(productService as any, 'handlePagination');
    await expect((productService as any).handlePagination(paginationBody)).resolves.toEqual(transactionResults);
    expect(handlePagination).toHaveBeenCalledTimes(1);
    expect(transactionPrismaMethod).toHaveBeenCalledTimes(1);
    expect(transactionPrismaMethod).toHaveBeenCalledWith(expect.any(Array));
    expect(findManyPrismaMethod).toHaveBeenCalledTimes(1);
    expect(findManyPrismaMethod).toHaveBeenCalledWith({
      select: paginationBody.query,
      take: paginationBody.pageSize,
      skip,
      where: {},
      orderBy: {
        product_id: 'desc',
      },
    });
    expect(countPrismaMethod).toHaveBeenCalledTimes(1);
    expect(countPrismaMethod).toHaveBeenCalledWith({
      where: {},
    });
  });

  it('handle pagination was success with keyword', async () => {
    expect.hasAssertions();
    const paginationBodyWithKeyword = {
      ...paginationBody,
      search: product.name,
    };
    const condition = {
      name: {
        contains: paginationBodyWithKeyword.search,
      },
    };
    const skip = calcSkip(paginationBody.pageSize, paginationBody.pageNumber);
    const transactionResults = [productList, length];
    const findManyPrismaMethod = jest.spyOn(prismaService.product, 'findMany');
    const countPrismaMethod = jest.spyOn(prismaService.product, 'count');
    const transactionPrismaMethod = jest.spyOn(prismaService, '$transaction').mockResolvedValue(transactionResults);
    const handlePagination = jest.spyOn(productService as any, 'handlePagination');
    await expect((productService as any).handlePagination(paginationBodyWithKeyword)).resolves.toEqual(
      transactionResults,
    );
    expect(handlePagination).toHaveBeenCalledTimes(1);
    expect(transactionPrismaMethod).toHaveBeenCalledTimes(1);
    expect(transactionPrismaMethod).toHaveBeenCalledWith(expect.any(Array));
    expect(findManyPrismaMethod).toHaveBeenCalledTimes(1);
    expect(findManyPrismaMethod).toHaveBeenCalledWith({
      select: paginationBodyWithKeyword.query,
      take: paginationBodyWithKeyword.pageSize,
      skip,
      where: condition,
      orderBy: {
        product_id: 'desc',
      },
    });
    expect(countPrismaMethod).toHaveBeenCalledTimes(1);
    expect(countPrismaMethod).toHaveBeenCalledWith({
      where: condition,
    });
  });

  it('handle pagination was success with categoryId', async () => {
    expect.hasAssertions();
    const paginationBodyWithCategoryId = {
      ...paginationBody,
      categoryId: product.category_id,
    };
    const condition = {
      category_id: paginationBodyWithCategoryId.categoryId,
    };
    const skip = calcSkip(paginationBody.pageSize, paginationBody.pageNumber);
    const transactionResults = [productList, length];
    const findManyPrismaMethod = jest.spyOn(prismaService.product, 'findMany');
    const countPrismaMethod = jest.spyOn(prismaService.product, 'count');
    const transactionPrismaMethod = jest.spyOn(prismaService, '$transaction').mockResolvedValue(transactionResults);
    const handlePagination = jest.spyOn(productService as any, 'handlePagination');
    await expect((productService as any).handlePagination(paginationBodyWithCategoryId)).resolves.toEqual(
      transactionResults,
    );
    expect(handlePagination).toHaveBeenCalledTimes(1);
    expect(transactionPrismaMethod).toHaveBeenCalledTimes(1);
    expect(transactionPrismaMethod).toHaveBeenCalledWith(expect.any(Array));
    expect(findManyPrismaMethod).toHaveBeenCalledTimes(1);
    expect(findManyPrismaMethod).toHaveBeenCalledWith({
      select: paginationBodyWithCategoryId.query,
      take: paginationBodyWithCategoryId.pageSize,
      skip,
      where: condition,
      orderBy: {
        product_id: 'desc',
      },
    });
    expect(countPrismaMethod).toHaveBeenCalledTimes(1);
    expect(countPrismaMethod).toHaveBeenCalledWith({
      where: condition,
    });
  });

  it('handle pagination success with extra conditions', async () => {
    expect.hasAssertions();
    const skip = calcSkip(paginationBody.pageSize, paginationBody.pageNumber);
    const transactionResults = [productList, length];
    const findManyPrismaMethod = jest.spyOn(prismaService.product, 'findMany');
    const countPrismaMethod = jest.spyOn(prismaService.product, 'count');
    const transactionPrismaMethod = jest.spyOn(prismaService, '$transaction').mockResolvedValue(transactionResults);
    const handlePagination = jest.spyOn(productService as any, 'handlePagination');
    await expect((productService as any).handlePagination(paginationBody, where)).resolves.toEqual(transactionResults);
    expect(handlePagination).toHaveBeenCalledTimes(1);
    expect(transactionPrismaMethod).toHaveBeenCalledTimes(1);
    expect(transactionPrismaMethod).toHaveBeenCalledWith(expect.any(Array));
    expect(findManyPrismaMethod).toHaveBeenCalledTimes(1);
    expect(findManyPrismaMethod).toHaveBeenCalledWith({
      select: paginationBody.query,
      take: paginationBody.pageSize,
      skip,
      where,
      orderBy: {
        product_id: 'desc',
      },
    });
    expect(countPrismaMethod).toHaveBeenCalledTimes(1);
    expect(countPrismaMethod).toHaveBeenCalledWith({
      where,
    });
  });

  it('handle pagination was success with a both categoryId and keyword and extra condition', async () => {
    expect.hasAssertions();
    const paginationBodyWithAllCondition = {
      ...paginationBody,
      categoryId: product.category_id,
      search: product.name,
    };
    const condition = {
      category_id: paginationBodyWithAllCondition.categoryId,
      name: {
        contains: paginationBodyWithAllCondition.search,
      },
      ...where,
    };
    const skip = calcSkip(paginationBody.pageSize, paginationBody.pageNumber);
    const transactionResults = [productList, length];
    const findManyPrismaMethod = jest.spyOn(prismaService.product, 'findMany');
    const countPrismaMethod = jest.spyOn(prismaService.product, 'count');
    const transactionPrismaMethod = jest.spyOn(prismaService, '$transaction').mockResolvedValue(transactionResults);
    const handlePagination = jest.spyOn(productService as any, 'handlePagination');
    await expect((productService as any).handlePagination(paginationBodyWithAllCondition, where)).resolves.toEqual(
      transactionResults,
    );
    expect(handlePagination).toHaveBeenCalledTimes(1);
    expect(transactionPrismaMethod).toHaveBeenCalledTimes(1);
    expect(transactionPrismaMethod).toHaveBeenCalledWith(expect.any(Array));
    expect(findManyPrismaMethod).toHaveBeenCalledTimes(1);
    expect(findManyPrismaMethod).toHaveBeenCalledWith({
      select: paginationBodyWithAllCondition.query,
      take: paginationBodyWithAllCondition.pageSize,
      skip,
      where: condition,
      orderBy: {
        product_id: 'desc',
      },
    });
    expect(countPrismaMethod).toHaveBeenCalledTimes(1);
    expect(countPrismaMethod).toHaveBeenCalledWith({
      where: condition,
    });
  });

  it('handle pagination was success with not found error', async () => {
    expect.hasAssertions();
    const skip = calcSkip(paginationBody.pageSize, paginationBody.pageNumber);
    const findManyPrismaMethod = jest.spyOn(prismaService.product, 'findMany');
    const countPrismaMethod = jest.spyOn(prismaService.product, 'count');
    const transactionPrismaMethod = jest.spyOn(prismaService, '$transaction').mockRejectedValue(PrismaNotFoundError);
    const handlePagination = jest.spyOn(productService as any, 'handlePagination');
    await expect((productService as any).handlePagination(paginationBody)).rejects.toThrow(PrismaNotFoundError);
    expect(handlePagination).toHaveBeenCalledTimes(1);
    expect(transactionPrismaMethod).toHaveBeenCalledTimes(1);
    expect(transactionPrismaMethod).toHaveBeenCalledWith(expect.any(Array));
    expect(findManyPrismaMethod).toHaveBeenCalledTimes(1);
    expect(findManyPrismaMethod).toHaveBeenCalledWith({
      select: paginationBody.query,
      take: paginationBody.pageSize,
      skip,
      where: {},
      orderBy: {
        product_id: 'desc',
      },
    });
    expect(countPrismaMethod).toHaveBeenCalledTimes(1);
    expect(countPrismaMethod).toHaveBeenCalledWith({
      where: {},
    });
  });

  it('handle pagination was success with unknown error', async () => {
    expect.hasAssertions();
    const skip = calcSkip(paginationBody.pageSize, paginationBody.pageNumber);
    const findManyPrismaMethod = jest.spyOn(prismaService.product, 'findMany');
    const countPrismaMethod = jest.spyOn(prismaService.product, 'count');
    const transactionPrismaMethod = jest.spyOn(prismaService, '$transaction').mockRejectedValue(UnknownError);
    const handlePagination = jest.spyOn(productService as any, 'handlePagination');
    await expect((productService as any).handlePagination(paginationBody)).rejects.toThrow(UnknownError);
    expect(handlePagination).toHaveBeenCalledTimes(1);
    expect(transactionPrismaMethod).toHaveBeenCalledTimes(1);
    expect(transactionPrismaMethod).toHaveBeenCalledWith(expect.any(Array));
    expect(findManyPrismaMethod).toHaveBeenCalledTimes(1);
    expect(findManyPrismaMethod).toHaveBeenCalledWith({
      select: paginationBody.query,
      take: paginationBody.pageSize,
      skip,
      where: {},
      orderBy: {
        product_id: 'desc',
      },
    });
    expect(countPrismaMethod).toHaveBeenCalledTimes(1);
    expect(countPrismaMethod).toHaveBeenCalledWith({
      where: {},
    });
  });

  it('handle pagination was success with database disconnect', async () => {
    expect.hasAssertions();
    const skip = calcSkip(paginationBody.pageSize, paginationBody.pageNumber);
    const findManyPrismaMethod = jest.spyOn(prismaService.product, 'findMany');
    const countPrismaMethod = jest.spyOn(prismaService.product, 'count');
    const transactionPrismaMethod = jest.spyOn(prismaService, '$transaction').mockRejectedValue(PrismaDisconnectError);
    const handlePagination = jest.spyOn(productService as any, 'handlePagination');
    await expect((productService as any).handlePagination(paginationBody)).rejects.toThrow(PrismaDisconnectError);
    expect(handlePagination).toHaveBeenCalledTimes(1);
    expect(transactionPrismaMethod).toHaveBeenCalledTimes(1);
    expect(transactionPrismaMethod).toHaveBeenCalledWith(expect.any(Array));
    expect(findManyPrismaMethod).toHaveBeenCalledTimes(1);
    expect(findManyPrismaMethod).toHaveBeenCalledWith({
      select: paginationBody.query,
      take: paginationBody.pageSize,
      skip,
      where: {},
      orderBy: {
        product_id: 'desc',
      },
    });
    expect(countPrismaMethod).toHaveBeenCalledTimes(1);
    expect(countPrismaMethod).toHaveBeenCalledWith({
      where: {},
    });
  });
});

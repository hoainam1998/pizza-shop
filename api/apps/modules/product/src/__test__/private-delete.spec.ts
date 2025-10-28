import { PrismaClient } from 'generated/prisma';
import startUp from './pre-setup';
import ProductService from '../product.service';
import { product } from '@share/test/pre-setup/mock/data/product';
import { PRISMA_CLIENT } from '@share/di-token';
import { PrismaDisconnectError, PrismaNotFoundError } from '@share/test/pre-setup/mock/errors/prisma-errors';

let productService: ProductService;
let prismaService: PrismaClient;

beforeEach(async () => {
  const moduleRef = await startUp();

  productService = moduleRef.get(ProductService);
  prismaService = moduleRef.get(PRISMA_CLIENT);
});

afterEach((done) => {
  jest.restoreAllMocks();
  jest.resetAllMocks();
  done();
});

describe('private delete', () => {
  it('private delete success', async () => {
    expect.hasAssertions();
    const deleteManyPrismaMethod = jest.spyOn(prismaService.product_ingredient, 'deleteMany');
    const deletePrismaMethod = jest.spyOn(prismaService.product, 'delete');
    const transactionPrismaMethod = jest
      .spyOn(prismaService, '$transaction')
      .mockResolvedValue([product.product_ingredient, product]);
    await expect((productService as any).delete(product.product_id)).resolves.toBe(product);
    expect(transactionPrismaMethod).toHaveBeenCalledTimes(1);
    expect(transactionPrismaMethod).toHaveBeenLastCalledWith(expect.any(Array));
    expect(deleteManyPrismaMethod).toHaveBeenCalledTimes(1);
    expect(deleteManyPrismaMethod).toHaveBeenCalledWith({
      where: {
        product_id: product.product_id,
      },
    });
    expect(deletePrismaMethod).toHaveBeenCalledTimes(1);
    expect(deletePrismaMethod).toHaveBeenCalledWith({
      where: {
        product_id: product.product_id,
      },
    });
  });

  it('private delete failed with not found error', async () => {
    expect.hasAssertions();
    const deleteManyPrismaMethod = jest.spyOn(prismaService.product_ingredient, 'deleteMany');
    const deletePrismaMethod = jest.spyOn(prismaService.product, 'delete').mockResolvedValue(product);
    const transactionPrismaMethod = jest.spyOn(prismaService, '$transaction').mockRejectedValue(PrismaNotFoundError);
    await expect((productService as any).delete(product.product_id)).rejects.toThrow(PrismaNotFoundError);
    expect(transactionPrismaMethod).toHaveBeenCalledTimes(1);
    expect(transactionPrismaMethod).toHaveBeenLastCalledWith(expect.any(Array));
    expect(deleteManyPrismaMethod).toHaveBeenCalledTimes(1);
    expect(deleteManyPrismaMethod).toHaveBeenCalledWith({
      where: {
        product_id: product.product_id,
      },
    });
    expect(deletePrismaMethod).toHaveBeenCalledTimes(1);
    expect(deletePrismaMethod).toHaveBeenCalledWith({
      where: {
        product_id: product.product_id,
      },
    });
  });

  it('private delete failed with database disconnect error', async () => {
    expect.hasAssertions();
    const deleteManyPrismaMethod = jest.spyOn(prismaService.product_ingredient, 'deleteMany');
    const deletePrismaMethod = jest.spyOn(prismaService.product, 'delete').mockResolvedValue(product);
    const transactionPrismaMethod = jest.spyOn(prismaService, '$transaction').mockRejectedValue(PrismaDisconnectError);
    await expect((productService as any).delete(product.product_id)).rejects.toThrow(PrismaDisconnectError);
    expect(transactionPrismaMethod).toHaveBeenCalledTimes(1);
    expect(transactionPrismaMethod).toHaveBeenLastCalledWith(expect.any(Array));
    expect(deleteManyPrismaMethod).toHaveBeenCalledTimes(1);
    expect(deleteManyPrismaMethod).toHaveBeenCalledWith({
      where: {
        product_id: product.product_id,
      },
    });
    expect(deletePrismaMethod).toHaveBeenCalledTimes(1);
    expect(deletePrismaMethod).toHaveBeenCalledWith({
      where: {
        product_id: product.product_id,
      },
    });
  });
});

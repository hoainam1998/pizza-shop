import { PrismaClient, Status } from 'generated/prisma';
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

describe('update product state expired', () => {
  it('update product state expired success', async () => {
    expect.hasAssertions();
    const updatePrismaMethod = jest.spyOn(prismaService.product, 'update').mockResolvedValue(product);
    await expect((productService as any).updateProductStateExpired(product.product_id)).resolves.toBe(product);
    expect(updatePrismaMethod).toHaveBeenCalledTimes(1);
    expect(updatePrismaMethod).toHaveBeenCalledWith({
      where: {
        product_id: product.product_id,
      },
      data: {
        status: Status.EXPIRED,
      },
    });
  });

  it('update product state expired failed with not found error', async () => {
    expect.hasAssertions();
    const updatePrismaMethod = jest.spyOn(prismaService.product, 'update').mockRejectedValue(PrismaNotFoundError);
    await expect((productService as any).updateProductStateExpired(product.product_id)).rejects.toThrow(
      PrismaNotFoundError,
    );
    expect(updatePrismaMethod).toHaveBeenCalledTimes(1);
    expect(updatePrismaMethod).toHaveBeenCalledWith({
      where: {
        product_id: product.product_id,
      },
      data: {
        status: Status.EXPIRED,
      },
    });
  });

  it('update product state expired failed with database disconnect error', async () => {
    expect.hasAssertions();
    const updatePrismaMethod = jest.spyOn(prismaService.product, 'update').mockRejectedValue(PrismaDisconnectError);
    await expect((productService as any).updateProductStateExpired(product.product_id)).rejects.toThrow(
      PrismaDisconnectError,
    );
    expect(updatePrismaMethod).toHaveBeenCalledTimes(1);
    expect(updatePrismaMethod).toHaveBeenCalledWith({
      where: {
        product_id: product.product_id,
      },
      data: {
        status: Status.EXPIRED,
      },
    });
  });
});

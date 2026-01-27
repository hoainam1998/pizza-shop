/* eslint-disable @typescript-eslint/no-unsafe-argument */
import startUp from './pre-setup';
import ProductService from '../product.service';
import { products, carts, selects, errorObject } from '@share/test/pre-setup/mock/data/bill';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import { PrismaDisconnectError } from '@share/test/pre-setup/mock/errors/prisma-errors';
import { PRISMA_CLIENT } from '@share/di-token';
import { PrismaClient } from 'generated/prisma';

let productService: ProductService;
let prismaService: PrismaClient;
const total = 10000;

beforeEach(async () => {
  const moduleRef = await startUp();
  productService = moduleRef.get(ProductService);
  prismaService = moduleRef.get(PRISMA_CLIENT);
});

describe('validate carts', () => {
  it('validate carts was success', async () => {
    expect.hasAssertions();
    const findUnique = jest
      .spyOn(prismaService.product, 'findUnique')
      .mockResolvedValueOnce(products[0] as any)
      .mockResolvedValueOnce(products[1] as any)
      .mockResolvedValueOnce(products[2] as any)
      .mockResolvedValueOnce(products[3] as any)
      .mockResolvedValueOnce(products[4] as any);
    const validateCartsService = jest.spyOn(productService as any, 'validateCarts');
    await expect((productService as any).validateCarts(carts, total)).resolves.toEqual(errorObject);
    expect(validateCartsService).toHaveBeenCalledTimes(1);
    expect(validateCartsService).toHaveBeenCalledWith(carts, total);
    expect(findUnique).toHaveBeenCalledTimes(carts.length);
    expect(findUnique.mock.calls).toEqual(selects);
  });

  it('validate carts failed with unknown error', async () => {
    expect.hasAssertions();
    const findUnique = jest.spyOn(prismaService.product, 'findUnique').mockRejectedValue(UnknownError);
    const validateCartsService = jest.spyOn(productService as any, 'validateCarts');
    await expect((productService as any).validateCarts(carts, total)).rejects.toThrow(UnknownError);
    expect(validateCartsService).toHaveBeenCalledTimes(1);
    expect(validateCartsService).toHaveBeenCalledWith(carts, total);
    expect(findUnique).toHaveBeenCalledTimes(carts.length);
    expect(findUnique.mock.calls).toEqual(selects);
  });

  it('validate carts failed with prisma disconnect error', async () => {
    expect.hasAssertions();
    const findUnique = jest.spyOn(prismaService.product, 'findUnique').mockRejectedValue(PrismaDisconnectError);
    const validateCartsService = jest.spyOn(productService as any, 'validateCarts');
    await expect((productService as any).validateCarts(carts, total)).rejects.toThrow(PrismaDisconnectError);
    expect(validateCartsService).toHaveBeenCalledTimes(1);
    expect(validateCartsService).toHaveBeenCalledWith(carts, total);
    expect(findUnique).toHaveBeenCalledTimes(carts.length);
    expect(findUnique.mock.calls).toEqual(selects);
  });
});

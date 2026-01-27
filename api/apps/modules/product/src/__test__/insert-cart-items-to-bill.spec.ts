import { PrismaClient } from 'generated/prisma';
import startUp from './pre-setup';
import ProductService from '../product.service';
import { carts, bill, billDetail } from '@share/test/pre-setup/mock/data/bill';
import { user } from '@share/test/pre-setup/mock/data/user';
import { PRISMA_CLIENT } from '@share/di-token';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import { PrismaDisconnectError } from '@share/test/pre-setup/mock/errors/prisma-errors';

let productService: ProductService;
let prismaService: PrismaClient;
const total = 10000;
const userId = user.user_id;

beforeEach(async () => {
  const moduleRef = await startUp();

  productService = moduleRef.get(ProductService);
  prismaService = moduleRef.get(PRISMA_CLIENT);
});

describe('insert cart items to bill', () => {
  it('insert cart items to bill was success', async () => {
    expect.hasAssertions();
    const create = jest.spyOn(prismaService.bill, 'create').mockResolvedValue(bill);
    const insertCartItemsToBill = jest.spyOn(productService as any, 'insertCartItemsToBill');
    await expect((productService as any).insertCartItemsToBill(userId, carts, total)).resolves.toEqual(bill);
    expect(insertCartItemsToBill).toHaveBeenCalledTimes(1);
    expect(insertCartItemsToBill).toHaveBeenCalledWith(userId, carts, total);
    expect(create).toHaveBeenCalledTimes(1);
    expect(create).toHaveBeenCalledWith({
      data: {
        bill_id: expect.any(String),
        user_id: bill.user_id,
        complete_total: total,
        created_at: expect.any(String),
        bill_detail: {
          createMany: {
            data: billDetail,
          },
        },
      },
    });
  });

  it('insert cart items failed with unknown error', async () => {
    expect.hasAssertions();
    const create = jest.spyOn(prismaService.bill, 'create').mockRejectedValue(UnknownError);
    const insertCartItemsToBill = jest.spyOn(productService as any, 'insertCartItemsToBill');
    await expect((productService as any).insertCartItemsToBill(userId, carts, total)).rejects.toThrow(UnknownError);
    expect(insertCartItemsToBill).toHaveBeenCalledTimes(1);
    expect(insertCartItemsToBill).toHaveBeenCalledWith(userId, carts, total);
    expect(create).toHaveBeenCalledTimes(1);
    expect(create).toHaveBeenCalledWith({
      data: {
        bill_id: expect.any(String),
        user_id: bill.user_id,
        complete_total: total,
        created_at: expect.any(String),
        bill_detail: {
          createMany: {
            data: billDetail,
          },
        },
      },
    });
  });

  it('insert cart items failed with prisma disconnect error', async () => {
    expect.hasAssertions();
    const create = jest.spyOn(prismaService.bill, 'create').mockRejectedValue(PrismaDisconnectError);
    const insertCartItemsToBill = jest.spyOn(productService as any, 'insertCartItemsToBill');
    await expect((productService as any).insertCartItemsToBill(userId, carts, total)).rejects.toThrow(
      PrismaDisconnectError,
    );
    expect(insertCartItemsToBill).toHaveBeenCalledTimes(1);
    expect(insertCartItemsToBill).toHaveBeenCalledWith(userId, carts, total);
    expect(create).toHaveBeenCalledTimes(1);
    expect(create).toHaveBeenCalledWith({
      data: {
        bill_id: expect.any(String),
        user_id: bill.user_id,
        complete_total: total,
        created_at: expect.any(String),
        bill_detail: {
          createMany: {
            data: billDetail,
          },
        },
      },
    });
  });
});

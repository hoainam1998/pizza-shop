import { PrismaClient } from 'generated/prisma';
import startUp from './pre-setup';
import ProductService from '../product.service';
import { createBills } from '@share/test/pre-setup/mock/data/bill';
import { PRISMA_CLIENT } from '@share/di-token';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import { PrismaDisconnectError } from '@share/test/pre-setup/mock/errors/prisma-errors';

let productService: ProductService;
let prismaService: PrismaClient;
const bills = createBills(2);

beforeAll(async () => {
  const moduleRef = await startUp();
  productService = moduleRef.get(ProductService);
  prismaService = moduleRef.get(PRISMA_CLIENT);
});

describe('get bills at specific time', () => {
  it('get bills at specific time success', async () => {
    expect.hasAssertions();
    const getBillsAtSpecificTime = jest.spyOn(productService as any, 'getBillsAtSpecificTime');
    const startTime = new Date();
    const endTime = new Date();
    endTime.setHours(endTime.getHours() + 1);
    const startTimestamp = startTime.getTime();
    const endTimestamp = endTime.getTime();
    const findMany = jest.spyOn(prismaService.bill, 'findMany').mockResolvedValue(bills);
    await expect((productService as any).getBillsAtSpecificTime(startTimestamp, endTimestamp)).resolves.toBe(bills);
    expect(getBillsAtSpecificTime).toHaveBeenCalledTimes(1);
    expect(findMany).toHaveBeenCalledTimes(1);
    expect(findMany).toHaveBeenCalledWith({
      where: {
        created_at: {
          gte: startTimestamp.toString(),
          lt: endTimestamp.toString(),
        },
      },
      select: {
        capital: true,
        complete_total: true,
        created_at: true,
      },
    });
  });

  it('get bills at specific time failed with unknown error', async () => {
    expect.hasAssertions();
    const getBillsAtSpecificTime = jest.spyOn(productService as any, 'getBillsAtSpecificTime');
    const startTime = new Date();
    const endTime = new Date();
    endTime.setHours(endTime.getHours() + 1);
    const startTimestamp = startTime.getTime();
    const endTimestamp = endTime.getTime();
    const findMany = jest.spyOn(prismaService.bill, 'findMany').mockRejectedValue(UnknownError);
    await expect((productService as any).getBillsAtSpecificTime(startTimestamp, endTimestamp)).rejects.toThrow(
      UnknownError,
    );
    expect(getBillsAtSpecificTime).toHaveBeenCalledTimes(1);
    expect(findMany).toHaveBeenCalledTimes(1);
    expect(findMany).toHaveBeenCalledWith({
      where: {
        created_at: {
          gte: startTimestamp.toString(),
          lt: endTimestamp.toString(),
        },
      },
      select: {
        capital: true,
        complete_total: true,
        created_at: true,
      },
    });
  });

  it('get bills at specific time failed with database disconnect error', async () => {
    expect.hasAssertions();
    const getBillsAtSpecificTime = jest.spyOn(productService as any, 'getBillsAtSpecificTime');
    const startTime = new Date();
    const endTime = new Date();
    endTime.setHours(endTime.getHours() + 1);
    const startTimestamp = startTime.getTime();
    const endTimestamp = endTime.getTime();
    const findMany = jest.spyOn(prismaService.bill, 'findMany').mockRejectedValue(PrismaDisconnectError);
    await expect((productService as any).getBillsAtSpecificTime(startTimestamp, endTimestamp)).rejects.toThrow(
      PrismaDisconnectError,
    );
    expect(getBillsAtSpecificTime).toHaveBeenCalledTimes(1);
    expect(findMany).toHaveBeenCalledTimes(1);
    expect(findMany).toHaveBeenCalledWith({
      where: {
        created_at: {
          gte: startTimestamp.toString(),
          lt: endTimestamp.toString(),
        },
      },
      select: {
        capital: true,
        complete_total: true,
        created_at: true,
      },
    });
  });
});

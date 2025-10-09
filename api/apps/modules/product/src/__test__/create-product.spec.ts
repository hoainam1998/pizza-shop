import { PrismaClient } from 'generated/prisma';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import { PrismaDisconnectError } from '@share/test/pre-setup/mock/errors/prisma-errors';
import { RpcException } from '@nestjs/microservices';
import startUp from './pre-setup';
import ProductController from '../product.controller';
import ProductService from '../product.service';
import { product } from '@share/test/pre-setup/mock/data/product';
import { PRISMA_CLIENT } from '@share/di-token';
import LoggingService from '@share/libs/logging/logging.service';
import { BadRequestException } from '@nestjs/common';
import { createMessage } from '@share/utils';
import messages from '@share/constants/messages';

let productController: ProductController;
let productService: ProductService;
let prismaService: PrismaClient;
let loggerService: LoggingService;
let schedulerService: SchedulerRegistry;

beforeEach(async () => {
  const moduleRef = await startUp();

  productService = moduleRef.get(ProductService);
  productController = moduleRef.get(ProductController);
  loggerService = moduleRef.get(LoggingService);
  schedulerService = moduleRef.get(SchedulerRegistry);
  prismaService = moduleRef.get(PRISMA_CLIENT);
});

afterEach((done) => {
  jest.restoreAllMocks();
  jest.resetAllMocks();
  done();
});

describe('create product', () => {
  it('create product was success', async () => {
    expect.hasAssertions();
    const log = jest.spyOn(loggerService, 'log');
    const addJob = jest.spyOn(schedulerService, 'addCronJob');
    const createPrismaMethod = jest.spyOn(prismaService.product, 'create').mockResolvedValue(product);
    const createMethodService = jest.spyOn(productService, 'createProduct');
    const createMethodController = jest.spyOn(productController, 'createProduct');
    await expect(productController.createProduct(product)).resolves.toBe(product);
    expect(createMethodController).toHaveBeenCalledTimes(1);
    expect(createMethodController).toHaveBeenCalledWith(product);
    expect(createMethodService).toHaveBeenCalledTimes(1);
    expect(createMethodService).toHaveBeenCalledWith(product);
    expect(createPrismaMethod).toHaveBeenCalledTimes(1);
    expect(createPrismaMethod).toHaveBeenCalledWith({
      data: product,
    });
    expect(addJob).toHaveBeenCalledTimes(1);
    expect(addJob).toHaveBeenCalledWith(expect.any(String), expect.any(CronJob));
    expect(globalThis.cronJob.start).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenCalledWith(expect.any(String), expect.any(String));
  });

  it('create product failed with unknown error', async () => {
    expect.hasAssertions();
    const log = jest.spyOn(loggerService, 'log');
    const addJob = jest.spyOn(schedulerService, 'addCronJob');
    const createPrismaMethod = jest.spyOn(prismaService.product, 'create').mockRejectedValue(UnknownError);
    const createMethodService = jest.spyOn(productService, 'createProduct');
    const createMethodController = jest.spyOn(productController, 'createProduct');
    await expect(productController.createProduct(product)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(messages.COMMON.COMMON_ERROR))),
    );
    expect(createMethodController).toHaveBeenCalledTimes(1);
    expect(createMethodController).toHaveBeenCalledWith(product);
    expect(createMethodService).toHaveBeenCalledTimes(1);
    expect(createMethodService).toHaveBeenCalledWith(product);
    expect(createPrismaMethod).toHaveBeenCalledTimes(1);
    expect(createPrismaMethod).toHaveBeenCalledWith({
      data: product,
    });
    expect(addJob).not.toHaveBeenCalled();
    expect(globalThis.cronJob.start).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenCalledWith(UnknownError.message, expect.any(String));
  });

  it('create product failed with unknown error', async () => {
    expect.hasAssertions();
    const log = jest.spyOn(loggerService, 'log');
    const addJob = jest.spyOn(schedulerService, 'addCronJob');
    const createPrismaMethod = jest.spyOn(prismaService.product, 'create').mockRejectedValue(PrismaDisconnectError);
    const createMethodService = jest.spyOn(productService, 'createProduct');
    const createMethodController = jest.spyOn(productController, 'createProduct');
    await expect(productController.createProduct(product)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(PrismaDisconnectError.message))),
    );
    expect(createMethodController).toHaveBeenCalledTimes(1);
    expect(createMethodController).toHaveBeenCalledWith(product);
    expect(createMethodService).toHaveBeenCalledTimes(1);
    expect(createMethodService).toHaveBeenCalledWith(product);
    expect(createPrismaMethod).toHaveBeenCalledTimes(1);
    expect(createPrismaMethod).toHaveBeenCalledWith({
      data: product,
    });
    expect(addJob).not.toHaveBeenCalled();
    expect(globalThis.cronJob.start).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenCalledWith(PrismaDisconnectError.message, expect.any(String));
  });
});

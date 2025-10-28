import { BadRequestException, NotFoundException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import startUp from './pre-setup';
import ProductController from '../product.controller';
import ProductService from '../product.service';
import SchedulerService from '@share/libs/scheduler/scheduler.service';
import { product } from '@share/test/pre-setup/mock/data/product';
import LoggingService from '@share/libs/logging/logging.service';
import messages from '@share/constants/messages';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import { createMessage } from '@share/utils';
import { PrismaDisconnectError, PrismaNotFoundError } from '@share/test/pre-setup/mock/errors/prisma-errors';

let productController: ProductController;
let productService: ProductService;
let loggerService: LoggingService;
let schedulerService: SchedulerService;

beforeEach(async () => {
  const moduleRef = await startUp();

  schedulerService = moduleRef.get(SchedulerService);
  productService = moduleRef.get(ProductService);
  productController = moduleRef.get(ProductController);
  loggerService = moduleRef.get(LoggingService);
});

afterEach((done) => {
  jest.restoreAllMocks();
  jest.resetAllMocks();
  done();
});

describe('delete product', () => {
  it('delete product was success', async () => {
    expect.hasAssertions();
    const privateDelete = jest.spyOn(productService as any, 'delete').mockResolvedValue(product);
    const deleteScheduler = jest.spyOn(schedulerService, 'deleteScheduler').mockImplementation(() => jest.fn());
    const deleteMethodService = jest.spyOn(productService, 'deleteProduct');
    const deleteProductControllerMethod = jest.spyOn(productController, 'deleteProduct');
    await expect(productController.deleteProduct(product.product_id)).resolves.toBe(product);
    expect(deleteProductControllerMethod).toHaveBeenCalledTimes(1);
    expect(deleteProductControllerMethod).toHaveBeenCalledWith(product.product_id);
    expect(deleteMethodService).toHaveBeenCalledTimes(1);
    expect(deleteMethodService).toHaveBeenCalledWith(product.product_id);
    expect(privateDelete).toHaveBeenCalledTimes(1);
    expect(privateDelete).toHaveBeenCalledWith(product.product_id);
    expect(deleteScheduler).toHaveBeenCalledTimes(1);
    expect(deleteScheduler).toHaveBeenCalledWith((productService as any)._jobName, expect.any(String));
  });

  it('delete product failed with not found error', async () => {
    expect.hasAssertions();
    const privateDelete = jest.spyOn(productService as any, 'delete').mockRejectedValue(PrismaNotFoundError);
    const deleteScheduler = jest.spyOn(schedulerService, 'deleteScheduler').mockImplementation(() => jest.fn());
    const deleteMethodService = jest.spyOn(productService, 'deleteProduct');
    const deleteProductControllerMethod = jest.spyOn(productController, 'deleteProduct');
    const logMethod = jest.spyOn(loggerService, 'log');
    await expect(productController.deleteProduct(product.product_id)).rejects.toThrow(
      new RpcException(new NotFoundException(messages.PRODUCT.NOT_FOUND)),
    );
    expect(deleteProductControllerMethod).toHaveBeenCalledTimes(1);
    expect(deleteProductControllerMethod).toHaveBeenCalledWith(product.product_id);
    expect(logMethod).toHaveBeenCalled();
    expect(logMethod).toHaveBeenCalledWith(messages.PRODUCT.NOT_FOUND, expect.any(String));
    expect(deleteMethodService).toHaveBeenCalledTimes(1);
    expect(deleteMethodService).toHaveBeenCalledWith(product.product_id);
    expect(privateDelete).toHaveBeenCalledTimes(1);
    expect(privateDelete).toHaveBeenCalledWith(product.product_id);
    expect(deleteScheduler).not.toHaveBeenCalled();
  });

  it('delete product failed with unknown error', async () => {
    expect.hasAssertions();
    const privateDelete = jest.spyOn(productService as any, 'delete').mockRejectedValue(UnknownError);
    const deleteScheduler = jest.spyOn(schedulerService, 'deleteScheduler').mockImplementation(() => jest.fn());
    const deleteMethodService = jest.spyOn(productService, 'deleteProduct');
    const deleteProductControllerMethod = jest.spyOn(productController, 'deleteProduct');
    const logMethod = jest.spyOn(loggerService, 'log');
    await expect(productController.deleteProduct(product.product_id)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(messages.COMMON.COMMON_ERROR))),
    );
    expect(deleteProductControllerMethod).toHaveBeenCalledTimes(1);
    expect(deleteProductControllerMethod).toHaveBeenCalledWith(product.product_id);
    expect(logMethod).toHaveBeenCalled();
    expect(logMethod).toHaveBeenCalledWith(UnknownError.message, expect.any(String));
    expect(deleteMethodService).toHaveBeenCalledTimes(1);
    expect(deleteMethodService).toHaveBeenCalledWith(product.product_id);
    expect(privateDelete).toHaveBeenCalledTimes(1);
    expect(privateDelete).toHaveBeenCalledWith(product.product_id);
    expect(deleteScheduler).not.toHaveBeenCalled();
  });

  it('delete product failed with database disconnect error', async () => {
    expect.hasAssertions();
    const privateDelete = jest.spyOn(productService as any, 'delete').mockRejectedValue(PrismaDisconnectError);
    const deleteScheduler = jest.spyOn(schedulerService, 'deleteScheduler').mockImplementation(() => jest.fn());
    const deleteMethodService = jest.spyOn(productService, 'deleteProduct');
    const deleteProductControllerMethod = jest.spyOn(productController, 'deleteProduct');
    const logMethod = jest.spyOn(loggerService, 'log');
    await expect(productController.deleteProduct(product.product_id)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(PrismaDisconnectError.message))),
    );
    expect(deleteProductControllerMethod).toHaveBeenCalledTimes(1);
    expect(deleteProductControllerMethod).toHaveBeenCalledWith(product.product_id);
    expect(logMethod).toHaveBeenCalled();
    expect(logMethod).toHaveBeenCalledWith(PrismaDisconnectError.message, expect.any(String));
    expect(deleteMethodService).toHaveBeenCalledTimes(1);
    expect(deleteMethodService).toHaveBeenCalledWith(product.product_id);
    expect(privateDelete).toHaveBeenCalledTimes(1);
    expect(privateDelete).toHaveBeenCalledWith(product.product_id);
    expect(deleteScheduler).not.toHaveBeenCalled();
  });
});

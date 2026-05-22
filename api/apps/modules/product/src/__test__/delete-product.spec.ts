import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { PrismaClient } from 'generated/prisma';
import startUp from './pre-setup';
import ProductController from '../product.controller';
import ProductService from '../product.service';
import ProductCachingService from '@share/libs/caching/product/product.service';
import { PRISMA_CLIENT, SOCKET_SERVICE } from '@share/di-token';
import SchedulerService from '@share/libs/scheduler/scheduler.service';
import { product } from '@share/test/pre-setup/mock/data/product';
import { user } from '@share/test/pre-setup/mock/data/user';
import LoggingService from '@share/libs/logging/logging.service';
import messages from '@share/constants/messages';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import { createMessage } from '@share/utils';
import { PrismaDisconnectError, PrismaNotFoundError } from '@share/test/pre-setup/mock/errors/prisma-errors';
import { refreshProductInfoPattern } from '@share/pattern';

let productController: ProductController;
let productService: ProductService;
let productCachingService: ProductCachingService;
let loggerService: LoggingService;
let schedulerService: SchedulerService;
let prismaService: PrismaClient;
let socketGateway: ClientProxy;
const visitorIds = [user.user_id];
const emitParameters = visitorIds.map((visitorId) => [refreshProductInfoPattern, visitorId]);

beforeAll(async () => {
  const moduleRef = await startUp();
  schedulerService = moduleRef.get(SchedulerService);
  productService = moduleRef.get(ProductService);
  productController = moduleRef.get(ProductController);
  loggerService = moduleRef.get(LoggingService);
  productCachingService = moduleRef.get(ProductCachingService);
  prismaService = moduleRef.get(PRISMA_CLIENT);
  socketGateway = moduleRef.get(SOCKET_SERVICE);
});

describe('delete product', () => {
  it('delete product was success', async () => {
    expect.hasAssertions();
    const deleteManyProductIngredients = jest.spyOn(prismaService.product_ingredient, 'deleteMany');
    const deleteProduct = jest.spyOn(prismaService.product, 'delete');
    const transaction = jest
      .spyOn(prismaService, '$transaction')
      .mockResolvedValue([product.product_ingredient, product]);
    const removeProductAccessByVisitor = jest
      .spyOn(productService as any, 'removeProductAccessByVisitor')
      .mockImplementation(jest.fn());
    const emit = jest.spyOn(socketGateway, 'emit').mockImplementation(jest.fn());
    const getVisitor = jest.spyOn(productCachingService, 'getVisitor').mockResolvedValue(visitorIds);
    const deleteScheduler = jest.spyOn(schedulerService, 'deleteScheduler').mockImplementation(() => jest.fn());
    const deleteMethodService = jest.spyOn(productService, 'deleteProduct');
    const deleteProductControllerMethod = jest.spyOn(productController, 'deleteProduct');
    await expect(productController.deleteProduct(product.product_id)).resolves.toBe(product);
    expect(deleteProductControllerMethod).toHaveBeenCalledTimes(1);
    expect(deleteProductControllerMethod).toHaveBeenCalledWith(product.product_id);
    expect(deleteMethodService).toHaveBeenCalledTimes(1);
    expect(deleteMethodService).toHaveBeenCalledWith(product.product_id);
    expect(deleteManyProductIngredients).toHaveBeenCalledTimes(1);
    expect(deleteManyProductIngredients).toHaveBeenCalledWith({
      where: {
        product_id: product.product_id,
      },
    });
    expect(deleteProduct).toHaveBeenCalledTimes(1);
    expect(deleteProduct).toHaveBeenCalledWith({
      where: {
        product_id: product.product_id,
      },
    });
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(deleteScheduler).toHaveBeenCalledTimes(1);
    expect(deleteScheduler).toHaveBeenCalledWith((productService as any)._jobName, expect.any(String));
    expect(getVisitor).toHaveBeenCalledTimes(1);
    expect(getVisitor).toHaveBeenCalledWith(product.product_id);
    expect(emit).toHaveBeenCalledTimes(visitorIds.length);
    expect(emit.mock.calls).toEqual(emitParameters);
    expect(removeProductAccessByVisitor).toHaveBeenCalledTimes(1);
    expect(removeProductAccessByVisitor).toHaveBeenCalledWith(product.product_id);
  });

  it('delete product failed with not found error', async () => {
    expect.hasAssertions();
    const deleteManyProductIngredients = jest.spyOn(prismaService.product_ingredient, 'deleteMany');
    const deleteProduct = jest.spyOn(prismaService.product, 'delete');
    const transaction = jest.spyOn(prismaService, '$transaction').mockRejectedValue(PrismaNotFoundError);
    const removeProductAccessByVisitor = jest
      .spyOn(productService as any, 'removeProductAccessByVisitor')
      .mockImplementation(jest.fn());
    const emit = jest.spyOn(socketGateway, 'emit').mockImplementation(jest.fn());
    const getVisitor = jest.spyOn(productCachingService, 'getVisitor').mockImplementation(jest.fn());
    const deleteScheduler = jest.spyOn(schedulerService, 'deleteScheduler').mockImplementation(() => jest.fn());
    const deleteMethodService = jest.spyOn(productService, 'deleteProduct');
    const deleteProductControllerMethod = jest.spyOn(productController, 'deleteProduct');
    const logMethod = jest.spyOn(loggerService, 'error');
    await expect(productController.deleteProduct(product.product_id)).rejects.toThrow(
      new RpcException(new NotFoundException(messages.PRODUCT.NOT_FOUND)),
    );
    expect(deleteProductControllerMethod).toHaveBeenCalledTimes(1);
    expect(deleteProductControllerMethod).toHaveBeenCalledWith(product.product_id);
    expect(logMethod).not.toHaveBeenCalled();
    expect(deleteMethodService).toHaveBeenCalledTimes(1);
    expect(deleteMethodService).toHaveBeenCalledWith(product.product_id);
    expect(deleteManyProductIngredients).toHaveBeenCalledTimes(1);
    expect(deleteManyProductIngredients).toHaveBeenCalledWith({
      where: {
        product_id: product.product_id,
      },
    });
    expect(deleteProduct).toHaveBeenCalledTimes(1);
    expect(deleteProduct).toHaveBeenCalledWith({
      where: {
        product_id: product.product_id,
      },
    });
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(deleteScheduler).not.toHaveBeenCalled();
    expect(getVisitor).not.toHaveBeenCalled();
    expect(emit).not.toHaveBeenCalled();
    expect(removeProductAccessByVisitor).not.toHaveBeenCalled();
  });

  it('delete product failed with unknown error', async () => {
    expect.hasAssertions();
    const deleteManyProductIngredients = jest.spyOn(prismaService.product_ingredient, 'deleteMany');
    const deleteProduct = jest.spyOn(prismaService.product, 'delete');
    const transaction = jest.spyOn(prismaService, '$transaction').mockRejectedValue(UnknownError);
    const removeProductAccessByVisitor = jest
      .spyOn(productService as any, 'removeProductAccessByVisitor')
      .mockImplementation(jest.fn());
    const emit = jest.spyOn(socketGateway, 'emit').mockImplementation(jest.fn());
    const getVisitor = jest.spyOn(productCachingService, 'getVisitor').mockImplementation(jest.fn());
    const deleteScheduler = jest.spyOn(schedulerService, 'deleteScheduler').mockImplementation(() => jest.fn());
    const deleteMethodService = jest.spyOn(productService, 'deleteProduct');
    const deleteProductControllerMethod = jest.spyOn(productController, 'deleteProduct');
    const logMethod = jest.spyOn(loggerService, 'error');
    await expect(productController.deleteProduct(product.product_id)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(messages.COMMON.COMMON_ERROR))),
    );
    expect(deleteProductControllerMethod).toHaveBeenCalledTimes(1);
    expect(deleteProductControllerMethod).toHaveBeenCalledWith(product.product_id);
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(UnknownError.message, expect.any(String));
    expect(deleteMethodService).toHaveBeenCalledTimes(1);
    expect(deleteMethodService).toHaveBeenCalledWith(product.product_id);
    expect(deleteManyProductIngredients).toHaveBeenCalledTimes(1);
    expect(deleteManyProductIngredients).toHaveBeenCalledWith({
      where: {
        product_id: product.product_id,
      },
    });
    expect(deleteProduct).toHaveBeenCalledTimes(1);
    expect(deleteProduct).toHaveBeenCalledWith({
      where: {
        product_id: product.product_id,
      },
    });
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(deleteScheduler).not.toHaveBeenCalled();
    expect(getVisitor).not.toHaveBeenCalled();
    expect(emit).not.toHaveBeenCalled();
    expect(removeProductAccessByVisitor).not.toHaveBeenCalled();
  });

  it('delete product failed with deleteScheduler got unknown error', async () => {
    expect.hasAssertions();
    const deleteManyProductIngredients = jest.spyOn(prismaService.product_ingredient, 'deleteMany');
    const deleteProduct = jest.spyOn(prismaService.product, 'delete');
    const transaction = jest
      .spyOn(prismaService, '$transaction')
      .mockResolvedValue([product.product_ingredient, product]);
    const removeProductAccessByVisitor = jest
      .spyOn(productService as any, 'removeProductAccessByVisitor')
      .mockImplementation(jest.fn());
    const emit = jest.spyOn(socketGateway, 'emit').mockImplementation(jest.fn());
    const getVisitor = jest.spyOn(productCachingService, 'getVisitor').mockImplementation(jest.fn());
    const deleteScheduler = jest.spyOn(schedulerService, 'deleteScheduler').mockImplementation(() => {
      throw UnknownError;
    });
    const deleteMethodService = jest.spyOn(productService, 'deleteProduct');
    const deleteProductControllerMethod = jest.spyOn(productController, 'deleteProduct');
    const logMethod = jest.spyOn(loggerService, 'error');
    await expect(productController.deleteProduct(product.product_id)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(messages.COMMON.COMMON_ERROR))),
    );
    expect(deleteProductControllerMethod).toHaveBeenCalledTimes(1);
    expect(deleteProductControllerMethod).toHaveBeenCalledWith(product.product_id);
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(UnknownError.message, expect.any(String));
    expect(deleteMethodService).toHaveBeenCalledTimes(1);
    expect(deleteMethodService).toHaveBeenCalledWith(product.product_id);
    expect(deleteManyProductIngredients).toHaveBeenCalledTimes(1);
    expect(deleteManyProductIngredients).toHaveBeenCalledWith({
      where: {
        product_id: product.product_id,
      },
    });
    expect(deleteProduct).toHaveBeenCalledTimes(1);
    expect(deleteProduct).toHaveBeenCalledWith({
      where: {
        product_id: product.product_id,
      },
    });
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(deleteScheduler).toHaveBeenCalledTimes(1);
    expect(deleteScheduler).toHaveBeenCalledWith((productService as any)._jobName, expect.any(String));
    expect(getVisitor).not.toHaveBeenCalled();
    expect(emit).not.toHaveBeenCalled();
    expect(removeProductAccessByVisitor).not.toHaveBeenCalled();
  });

  it('delete product failed with getVisitor got unknown error', async () => {
    expect.hasAssertions();
    const deleteManyProductIngredients = jest.spyOn(prismaService.product_ingredient, 'deleteMany');
    const deleteProduct = jest.spyOn(prismaService.product, 'delete');
    const transaction = jest
      .spyOn(prismaService, '$transaction')
      .mockResolvedValue([product.product_ingredient, product]);
    const removeProductAccessByVisitor = jest
      .spyOn(productService as any, 'removeProductAccessByVisitor')
      .mockImplementation(jest.fn());
    const emit = jest.spyOn(socketGateway, 'emit').mockImplementation(jest.fn());
    const getVisitor = jest.spyOn(productCachingService, 'getVisitor').mockImplementation(() => {
      throw UnknownError;
    });
    const deleteScheduler = jest.spyOn(schedulerService, 'deleteScheduler').mockImplementation(jest.fn);
    const deleteMethodService = jest.spyOn(productService, 'deleteProduct');
    const deleteProductControllerMethod = jest.spyOn(productController, 'deleteProduct');
    const logMethod = jest.spyOn(loggerService, 'error');
    await expect(productController.deleteProduct(product.product_id)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(messages.COMMON.COMMON_ERROR))),
    );
    expect(deleteProductControllerMethod).toHaveBeenCalledTimes(1);
    expect(deleteProductControllerMethod).toHaveBeenCalledWith(product.product_id);
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(UnknownError.message, expect.any(String));
    expect(deleteMethodService).toHaveBeenCalledTimes(1);
    expect(deleteMethodService).toHaveBeenCalledWith(product.product_id);
    expect(deleteManyProductIngredients).toHaveBeenCalledTimes(1);
    expect(deleteManyProductIngredients).toHaveBeenCalledWith({
      where: {
        product_id: product.product_id,
      },
    });
    expect(deleteProduct).toHaveBeenCalledTimes(1);
    expect(deleteProduct).toHaveBeenCalledWith({
      where: {
        product_id: product.product_id,
      },
    });
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(deleteScheduler).toHaveBeenCalledTimes(1);
    expect(deleteScheduler).toHaveBeenCalledWith((productService as any)._jobName, expect.any(String));
    expect(getVisitor).toHaveBeenCalledTimes(1);
    expect(getVisitor).toHaveBeenCalledWith(product.product_id);
    expect(emit).not.toHaveBeenCalled();
    expect(removeProductAccessByVisitor).not.toHaveBeenCalled();
  });

  it('delete product failed with removeProductAccessByVisitor got unknown error', async () => {
    expect.hasAssertions();
    const deleteManyProductIngredients = jest.spyOn(prismaService.product_ingredient, 'deleteMany');
    const deleteProduct = jest.spyOn(prismaService.product, 'delete');
    const transaction = jest
      .spyOn(prismaService, '$transaction')
      .mockResolvedValue([product.product_ingredient, product]);
    const removeProductAccessByVisitor = jest
      .spyOn(productService as any, 'removeProductAccessByVisitor')
      .mockImplementation(() => {
        throw UnknownError;
      });
    const emit = jest.spyOn(socketGateway, 'emit').mockImplementation(jest.fn());
    const getVisitor = jest.spyOn(productCachingService, 'getVisitor').mockResolvedValue(visitorIds);
    const deleteScheduler = jest.spyOn(schedulerService, 'deleteScheduler').mockImplementation(jest.fn);
    const deleteMethodService = jest.spyOn(productService, 'deleteProduct');
    const deleteProductControllerMethod = jest.spyOn(productController, 'deleteProduct');
    const logMethod = jest.spyOn(loggerService, 'error');
    await expect(productController.deleteProduct(product.product_id)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(messages.COMMON.COMMON_ERROR))),
    );
    expect(deleteProductControllerMethod).toHaveBeenCalledTimes(1);
    expect(deleteProductControllerMethod).toHaveBeenCalledWith(product.product_id);
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(UnknownError.message, expect.any(String));
    expect(deleteMethodService).toHaveBeenCalledTimes(1);
    expect(deleteMethodService).toHaveBeenCalledWith(product.product_id);
    expect(deleteManyProductIngredients).toHaveBeenCalledTimes(1);
    expect(deleteManyProductIngredients).toHaveBeenCalledWith({
      where: {
        product_id: product.product_id,
      },
    });
    expect(deleteProduct).toHaveBeenCalledTimes(1);
    expect(deleteProduct).toHaveBeenCalledWith({
      where: {
        product_id: product.product_id,
      },
    });
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(deleteScheduler).toHaveBeenCalledTimes(1);
    expect(deleteScheduler).toHaveBeenCalledWith((productService as any)._jobName, expect.any(String));
    expect(getVisitor).toHaveBeenCalledTimes(1);
    expect(getVisitor).toHaveBeenCalledWith(product.product_id);
    expect(emit).toHaveBeenCalledTimes(visitorIds.length);
    expect(emit.mock.calls).toEqual(emitParameters);
    expect(removeProductAccessByVisitor).toHaveBeenCalledTimes(1);
    expect(removeProductAccessByVisitor).toHaveBeenCalledWith(product.product_id);
  });

  it('delete product failed with database disconnect error', async () => {
    expect.hasAssertions();
    const deleteManyProductIngredients = jest.spyOn(prismaService.product_ingredient, 'deleteMany');
    const deleteProduct = jest.spyOn(prismaService.product, 'delete');
    const transaction = jest.spyOn(prismaService, '$transaction').mockRejectedValue(PrismaDisconnectError);
    const removeProductAccessByVisitor = jest
      .spyOn(productService as any, 'removeProductAccessByVisitor')
      .mockImplementation(jest.fn());
    const emit = jest.spyOn(socketGateway, 'emit').mockImplementation(jest.fn());
    const getVisitor = jest.spyOn(productCachingService, 'getVisitor').mockImplementation(jest.fn());
    const deleteScheduler = jest.spyOn(schedulerService, 'deleteScheduler').mockImplementation(() => jest.fn());
    const deleteMethodService = jest.spyOn(productService, 'deleteProduct');
    const deleteProductControllerMethod = jest.spyOn(productController, 'deleteProduct');
    const logMethod = jest.spyOn(loggerService, 'error');
    await expect(productController.deleteProduct(product.product_id)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(PrismaDisconnectError.message))),
    );
    expect(deleteProductControllerMethod).toHaveBeenCalledTimes(1);
    expect(deleteProductControllerMethod).toHaveBeenCalledWith(product.product_id);
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(PrismaDisconnectError.message, expect.any(String));
    expect(deleteMethodService).toHaveBeenCalledTimes(1);
    expect(deleteMethodService).toHaveBeenCalledWith(product.product_id);
    expect(deleteManyProductIngredients).toHaveBeenCalledTimes(1);
    expect(deleteManyProductIngredients).toHaveBeenCalledWith({
      where: {
        product_id: product.product_id,
      },
    });
    expect(deleteProduct).toHaveBeenCalledTimes(1);
    expect(deleteProduct).toHaveBeenCalledWith({
      where: {
        product_id: product.product_id,
      },
    });
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(deleteScheduler).not.toHaveBeenCalled();
    expect(getVisitor).not.toHaveBeenCalled();
    expect(emit).not.toHaveBeenCalled();
    expect(removeProductAccessByVisitor).not.toHaveBeenCalled();
  });
});

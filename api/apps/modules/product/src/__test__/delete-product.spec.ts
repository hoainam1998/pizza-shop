import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaClient } from 'generated/prisma';
import { RpcException } from '@nestjs/microservices';
import startUp from './pre-setup';
import ProductController from '../product.controller';
import ProductService from '../product.service';
import { product } from '@share/test/pre-setup/mock/data/product';
import { PRISMA_CLIENT } from '@share/di-token';
import LoggingService from '@share/libs/logging/logging.service';
import messages from '@share/constants/messages';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import { createMessage } from '@share/utils';
import { PrismaDisconnectError, PrismaNotFoundError } from '@share/test/pre-setup/mock/errors/prisma-errors';

let productController: ProductController;
let productService: ProductService;
let prismaService: PrismaClient;
let loggerService: LoggingService;

beforeEach(async () => {
  const moduleRef = await startUp();

  productService = moduleRef.get(ProductService);
  productController = moduleRef.get(ProductController);
  loggerService = moduleRef.get(LoggingService);
  prismaService = moduleRef.get(PRISMA_CLIENT);
});

afterEach((done) => {
  jest.restoreAllMocks();
  jest.resetAllMocks();
  done();
});

describe('delete product', () => {
  it('delete product was success', async () => {
    expect.hasAssertions();
    const deleteManyPrismaMethod = jest.spyOn(prismaService.product_ingredient, 'deleteMany');
    const deletePrismaMethod = jest.spyOn(prismaService.product, 'delete');
    const transactionPrismaMethod = jest
      .spyOn(prismaService, '$transaction')
      .mockResolvedValue([product.product_ingredient, product]);
    const deleteMethodService = jest.spyOn(productService, 'deleteProduct');
    const deleteProductControllerMethod = jest.spyOn(productController, 'deleteProduct');
    await expect(productController.deleteProduct(product.product_id)).resolves.toBe(product);
    expect(deleteProductControllerMethod).toHaveBeenCalledTimes(1);
    expect(deleteProductControllerMethod).toHaveBeenCalledWith(product.product_id);
    expect(deleteMethodService).toHaveBeenCalledTimes(1);
    expect(deleteMethodService).toHaveBeenCalledWith(product.product_id);
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

  it('delete product failed with not found error', async () => {
    expect.hasAssertions();
    const deleteManyPrismaMethod = jest.spyOn(prismaService.product_ingredient, 'deleteMany');
    const deletePrismaMethod = jest.spyOn(prismaService.product, 'delete');
    const transactionPrismaMethod = jest.spyOn(prismaService, '$transaction').mockRejectedValue(PrismaNotFoundError);
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
    expect(transactionPrismaMethod).toHaveBeenCalledTimes(1);
    expect(transactionPrismaMethod).toHaveBeenCalledWith(expect.any(Array));
    expect(deleteMethodService).toHaveBeenCalledTimes(1);
    expect(deleteMethodService).toHaveBeenCalledWith(product.product_id);
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

  it('delete product failed with unknown error', async () => {
    expect.hasAssertions();
    const deleteManyPrismaMethod = jest.spyOn(prismaService.product_ingredient, 'deleteMany');
    const deletePrismaMethod = jest.spyOn(prismaService.product, 'delete');
    const transactionPrismaMethod = jest.spyOn(prismaService, '$transaction').mockRejectedValue(UnknownError);
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
    expect(transactionPrismaMethod).toHaveBeenCalledTimes(1);
    expect(transactionPrismaMethod).toHaveBeenCalledWith(expect.any(Array));
    expect(deleteMethodService).toHaveBeenCalledTimes(1);
    expect(deleteMethodService).toHaveBeenCalledWith(product.product_id);
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

  it('delete product failed with database disconnect error', async () => {
    expect.hasAssertions();
    const deleteManyPrismaMethod = jest.spyOn(prismaService.product_ingredient, 'deleteMany');
    const deletePrismaMethod = jest.spyOn(prismaService.product, 'delete');
    const transactionPrismaMethod = jest.spyOn(prismaService, '$transaction').mockRejectedValue(PrismaDisconnectError);
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
    expect(transactionPrismaMethod).toHaveBeenCalledTimes(1);
    expect(transactionPrismaMethod).toHaveBeenCalledWith(expect.any(Array));
    expect(deleteMethodService).toHaveBeenCalledTimes(1);
    expect(deleteMethodService).toHaveBeenCalledWith(product.product_id);
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

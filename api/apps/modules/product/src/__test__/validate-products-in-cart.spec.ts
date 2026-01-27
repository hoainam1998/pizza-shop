import { BadRequestException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import startUp from './pre-setup';
import ProductController from '../product.controller';
import ProductService from '../product.service';
import { carts, errorObject } from '@share/test/pre-setup/mock/data/bill';
import LoggingService from '@share/libs/logging/logging.service';
import { createMessage } from '@share/utils';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import messages from '@share/constants/messages';
import { PrismaDisconnectError } from '@share/test/pre-setup/mock/errors/prisma-errors';

let productController: ProductController;
let productService: ProductService;
let loggerService: LoggingService;
const total = 10000;
const payload = {
  carts,
  total,
};

beforeEach(async () => {
  const moduleRef = await startUp();

  productService = moduleRef.get(ProductService);
  productController = moduleRef.get(ProductController);
  loggerService = moduleRef.get(LoggingService);
});

describe('validate products in cart', () => {
  it('validate products in cart was success', async () => {
    expect.hasAssertions();
    const validateCartsService = jest.spyOn(productService as any, 'validateCarts').mockResolvedValue(errorObject);
    const validateCartsController = jest.spyOn(productController as any, 'validateProductsInCart');
    await expect(productController.validateProductsInCart(payload)).resolves.toEqual(errorObject);
    expect(validateCartsController).toHaveBeenCalledTimes(1);
    expect(validateCartsController).toHaveBeenCalledWith(payload);
    expect(validateCartsService).toHaveBeenCalledTimes(1);
    expect(validateCartsService).toHaveBeenCalledWith(payload.carts, payload.total);
  });

  it('validate products in cart failed with unknown error', async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(loggerService, 'error');
    const validateCartsService = jest.spyOn(productService as any, 'validateCarts').mockRejectedValue(UnknownError);
    const validateCartsController = jest.spyOn(productController as any, 'validateProductsInCart');
    await expect(productController.validateProductsInCart(payload)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(messages.COMMON.COMMON_ERROR))),
    );
    expect(validateCartsController).toHaveBeenCalledTimes(1);
    expect(validateCartsController).toHaveBeenCalledWith(payload);
    expect(validateCartsService).toHaveBeenCalledTimes(1);
    expect(validateCartsService).toHaveBeenCalledWith(payload.carts, payload.total);
    expect(logError).toHaveBeenCalledWith(UnknownError.message, expect.any(String));
  });

  it('validate products in cart failed with prisma disconnect error', async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(loggerService, 'error');
    const validateCartsService = jest
      .spyOn(productService as any, 'validateCarts')
      .mockRejectedValue(PrismaDisconnectError);
    const validateCartsController = jest.spyOn(productController as any, 'validateProductsInCart');
    await expect(productController.validateProductsInCart(payload)).rejects.toThrow(
      new RpcException(new BadRequestException(PrismaDisconnectError.message)),
    );
    expect(validateCartsController).toHaveBeenCalledTimes(1);
    expect(validateCartsController).toHaveBeenCalledWith(payload);
    expect(validateCartsService).toHaveBeenCalledTimes(1);
    expect(validateCartsService).toHaveBeenCalledWith(payload.carts, payload.total);
    expect(logError).toHaveBeenCalledWith(PrismaDisconnectError.message, expect.any(String));
  });
});

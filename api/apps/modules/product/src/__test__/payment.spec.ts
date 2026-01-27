import { BadRequestException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import startUp from './pre-setup';
import ProductController from '../product.controller';
import ProductService from '../product.service';
import { carts, errorObject, bill, errorObjectWithValidateOk } from '@share/test/pre-setup/mock/data/bill';
import { user } from '@share/test/pre-setup/mock/data/user';
import LoggingService from '@share/libs/logging/logging.service';
import { createMessage } from '@share/utils';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import messages from '@share/constants/messages';
import { PrismaDisconnectError } from '@share/test/pre-setup/mock/errors/prisma-errors';

let productController: ProductController;
let productService: ProductService;
let loggerService: LoggingService;
const total = 10000;
const userId = user.user_id;
const payload = {
  carts,
  total,
};

const billCreate = {
  bill: payload,
  userId,
};

beforeEach(async () => {
  const moduleRef = await startUp();

  productService = moduleRef.get(ProductService);
  productController = moduleRef.get(ProductController);
  loggerService = moduleRef.get(LoggingService);
});

describe('payment', () => {
  it('payment was success', async () => {
    expect.hasAssertions();
    const insertCartItemsToBillService = jest
      .spyOn(productService as any, 'insertCartItemsToBill')
      .mockResolvedValue(bill);
    const validateCartsService = jest
      .spyOn(productService as any, 'validateCarts')
      .mockResolvedValue(errorObjectWithValidateOk);
    const paymentController = jest.spyOn(productController as any, 'payment');
    await expect(productController.payment(billCreate)).resolves.toEqual(errorObjectWithValidateOk);
    expect(paymentController).toHaveBeenCalledTimes(1);
    expect(paymentController).toHaveBeenCalledWith(billCreate);
    expect(validateCartsService).toHaveBeenCalledTimes(1);
    expect(validateCartsService).toHaveBeenCalledWith(payload.carts, payload.total);
    expect(insertCartItemsToBillService).toHaveBeenCalledTimes(1);
    expect(insertCartItemsToBillService).toHaveBeenCalledWith(userId, payload.carts, payload.total);
  });

  it('payment was failed with validate result is false', async () => {
    expect.hasAssertions();
    const insertCartItemsToBillService = jest
      .spyOn(productService as any, 'insertCartItemsToBill')
      .mockResolvedValue(bill);
    const validateCartsService = jest.spyOn(productService as any, 'validateCarts').mockResolvedValue(errorObject);
    const paymentController = jest.spyOn(productController as any, 'payment');
    await expect(productController.payment(billCreate)).resolves.toEqual(errorObject);
    expect(paymentController).toHaveBeenCalledTimes(1);
    expect(paymentController).toHaveBeenCalledWith(billCreate);
    expect(validateCartsService).toHaveBeenCalledTimes(1);
    expect(validateCartsService).toHaveBeenCalledWith(payload.carts, payload.total);
    expect(insertCartItemsToBillService).not.toHaveBeenCalled();
  });

  it('payment failed with validateCarts got unknown error', async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(loggerService, 'error');
    const insertCartItemsToBillService = jest
      .spyOn(productService as any, 'insertCartItemsToBill')
      .mockResolvedValue(bill);
    const validateCartsService = jest.spyOn(productService as any, 'validateCarts').mockRejectedValue(UnknownError);
    const paymentController = jest.spyOn(productController as any, 'payment');
    await expect(productController.payment(billCreate)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(messages.COMMON.COMMON_ERROR))),
    );
    expect(paymentController).toHaveBeenCalledTimes(1);
    expect(paymentController).toHaveBeenCalledWith(billCreate);
    expect(validateCartsService).toHaveBeenCalledTimes(1);
    expect(validateCartsService).toHaveBeenCalledWith(payload.carts, payload.total);
    expect(insertCartItemsToBillService).not.toHaveBeenCalled();
    expect(logError).toHaveBeenCalledTimes(1);
    expect(logError).toHaveBeenLastCalledWith(UnknownError.message, expect.any(String));
  });

  it('payment failed with insertCartItemsToBillService got unknown error', async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(loggerService, 'error');
    const insertCartItemsToBillService = jest
      .spyOn(productService as any, 'insertCartItemsToBill')
      .mockRejectedValue(UnknownError);
    const validateCartsService = jest
      .spyOn(productService as any, 'validateCarts')
      .mockResolvedValue(errorObjectWithValidateOk);
    const paymentController = jest.spyOn(productController as any, 'payment');
    await expect(productController.payment(billCreate)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(messages.COMMON.COMMON_ERROR))),
    );
    expect(paymentController).toHaveBeenCalledTimes(1);
    expect(paymentController).toHaveBeenCalledWith(billCreate);
    expect(validateCartsService).toHaveBeenCalledTimes(1);
    expect(validateCartsService).toHaveBeenCalledWith(payload.carts, payload.total);
    expect(insertCartItemsToBillService).toHaveBeenCalledTimes(1);
    expect(insertCartItemsToBillService).toHaveBeenCalledWith(userId, payload.carts, payload.total);
    expect(logError).toHaveBeenCalledTimes(1);
    expect(logError).toHaveBeenLastCalledWith(UnknownError.message, expect.any(String));
  });

  it('payment failed with validateCarts got database disconnect error', async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(loggerService, 'error');
    const insertCartItemsToBillService = jest
      .spyOn(productService as any, 'insertCartItemsToBill')
      .mockResolvedValue(bill);
    const validateCartsService = jest
      .spyOn(productService as any, 'validateCarts')
      .mockRejectedValue(PrismaDisconnectError);
    const paymentController = jest.spyOn(productController as any, 'payment');
    await expect(productController.payment(billCreate)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(PrismaDisconnectError.message))),
    );
    expect(paymentController).toHaveBeenCalledTimes(1);
    expect(paymentController).toHaveBeenCalledWith(billCreate);
    expect(validateCartsService).toHaveBeenCalledTimes(1);
    expect(validateCartsService).toHaveBeenCalledWith(payload.carts, payload.total);
    expect(insertCartItemsToBillService).not.toHaveBeenCalled();
    expect(logError).toHaveBeenCalledTimes(1);
    expect(logError).toHaveBeenLastCalledWith(PrismaDisconnectError.message, expect.any(String));
  });

  it('payment failed with insertCartItemsToBillService got database disconnect error', async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(loggerService, 'error');
    const insertCartItemsToBillService = jest
      .spyOn(productService as any, 'insertCartItemsToBill')
      .mockRejectedValue(PrismaDisconnectError);
    const validateCartsService = jest
      .spyOn(productService as any, 'validateCarts')
      .mockResolvedValue(errorObjectWithValidateOk);
    const paymentController = jest.spyOn(productController as any, 'payment');
    await expect(productController.payment(billCreate)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(PrismaDisconnectError.message))),
    );
    expect(paymentController).toHaveBeenCalledTimes(1);
    expect(paymentController).toHaveBeenCalledWith(billCreate);
    expect(validateCartsService).toHaveBeenCalledTimes(1);
    expect(validateCartsService).toHaveBeenCalledWith(payload.carts, payload.total);
    expect(insertCartItemsToBillService).toHaveBeenCalledTimes(1);
    expect(insertCartItemsToBillService).toHaveBeenCalledWith(userId, payload.carts, payload.total);
    expect(logError).toHaveBeenCalledTimes(1);
    expect(logError).toHaveBeenLastCalledWith(PrismaDisconnectError.message, expect.any(String));
  });
});

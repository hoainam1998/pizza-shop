import { BadRequestException, HttpStatus, InternalServerErrorException, RequestMethod } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { expect } from '@jest/globals';
import { ValidationError } from 'class-validator';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import TestAgent from 'supertest/lib/agent';
import startUp from './pre-setup';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import { PrismaDisconnectError } from '@share/test/pre-setup/mock/errors/prisma-errors';
import { validateProductsInCartPattern } from '@share/pattern';
import { sessionPayload } from '@share/test/pre-setup/mock/data/user';
import { carts, errorObject } from '@share/test/pre-setup/mock/data/bill';
import { createDescribeTest, createTestName, getMockModule } from '@share/test/helpers';
import ProductService from '../product.service';
import ProductController from '../product.controller';
import ProductModule from '../product.module';
import messages from '@share/constants/messages';
import { HTTP_METHOD } from '@share/enums';
import { createMessages } from '@share/utils';
import { BillErrors } from '@share/dto/serializer/product';
import { ProductRouter } from '@share/router';

const validateProductsInCartUrl = ProductRouter.absolute.validateProductsInCart;
const MockProductModule = getMockModule(ProductModule, { path: validateProductsInCartUrl, method: RequestMethod.POST });

let api: TestAgent;
let clientProxy: ClientProxy;
let close: () => Promise<void>;
let productService: ProductService;
let productController: ProductController;
const total = 10000;
const requestBody = {
  carts,
  total,
};

beforeEach(async () => {
  const requestTest = await startUp(MockProductModule);
  api = requestTest.api;
  clientProxy = requestTest.clientProxy;
  close = () => requestTest.app.close();
  productService = requestTest.app.get(ProductService);
  productController = requestTest.app.get(ProductController);
});

afterEach(async () => {
  if (close) {
    await close();
  }
});

describe(createDescribeTest(HTTP_METHOD.POST, validateProductsInCartUrl), () => {
  it(createTestName('validate products in cart was success', HttpStatus.OK), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(errorObject));
    const validateProductsInCartService = jest.spyOn(productService, 'validateProductsInCart');
    await api
      .post(validateProductsInCartUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(requestBody)
      .expect(HttpStatus.OK)
      .expect('Content-Type', /application\/json/)
      .expect(errorObject);
    expect(validateProductsInCartService).toHaveBeenCalledTimes(1);
    expect(validateProductsInCartService).toHaveBeenCalledWith(requestBody);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(validateProductsInCartPattern, requestBody);
  });

  it(
    createTestName('validate products in cart failed with authentication error', HttpStatus.UNAUTHORIZED),
    async () => {
      expect.hasAssertions();
      const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(errorObject));
      const validateProductsInCartService = jest.spyOn(productService, 'validateProductsInCart');
      await api
        .post(validateProductsInCartUrl)
        .send(requestBody)
        .expect(HttpStatus.UNAUTHORIZED)
        .expect('Content-Type', /application\/json/)
        .expect(createMessages(messages.USER.DID_NOT_LOGIN));
      expect(validateProductsInCartService).not.toHaveBeenCalled();
      expect(send).not.toHaveBeenCalled();
    },
  );

  it(createTestName('validate products in cart failed with output validate', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const validatorErrors = [new ValidationError()];
    const logError = jest.spyOn(productController as any, 'logError').mockImplementation(() => jest.fn());
    jest.spyOn(BillErrors.prototype, 'validate').mockResolvedValue(validatorErrors);
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(errorObject));
    const validateProductsInCartService = jest.spyOn(productService, 'validateProductsInCart');
    await api
      .post(validateProductsInCartUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(requestBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.COMMON.OUTPUT_VALIDATE));
    expect(validateProductsInCartService).toHaveBeenCalledTimes(1);
    expect(validateProductsInCartService).toHaveBeenCalledWith(requestBody);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(validateProductsInCartPattern, requestBody);
    expect(logError).toHaveBeenCalledTimes(1);
    expect(logError).toHaveBeenCalledWith(validatorErrors, expect.any(String));
  });

  it(
    createTestName('validate products in cart failed with unknown error', HttpStatus.INTERNAL_SERVER_ERROR),
    async () => {
      expect.hasAssertions();
      const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => UnknownError));
      const validateProductsInCartService = jest.spyOn(productService, 'validateProductsInCart');
      await api
        .post(validateProductsInCartUrl)
        .set('mock-session', JSON.stringify(sessionPayload))
        .send(requestBody)
        .expect(HttpStatus.INTERNAL_SERVER_ERROR)
        .expect('Content-Type', /application\/json/)
        .expect(createMessages(new InternalServerErrorException().message));
      expect(validateProductsInCartService).toHaveBeenCalledTimes(1);
      expect(validateProductsInCartService).toHaveBeenCalledWith(requestBody);
      expect(send).toHaveBeenCalledTimes(1);
      expect(send).toHaveBeenCalledWith(validateProductsInCartPattern, requestBody);
    },
  );

  it(
    createTestName('validate products in cart failed with rpc unknown error', HttpStatus.INTERNAL_SERVER_ERROR),
    async () => {
      expect.hasAssertions();
      const send = jest
        .spyOn(clientProxy, 'send')
        .mockReturnValue(throwError(() => new RpcException(new BadRequestException(messages.COMMON.COMMON_ERROR))));
      const validateProductsInCartService = jest.spyOn(productService, 'validateProductsInCart');
      await api
        .post(validateProductsInCartUrl)
        .set('mock-session', JSON.stringify(sessionPayload))
        .send(requestBody)
        .expect(HttpStatus.INTERNAL_SERVER_ERROR)
        .expect('Content-Type', /application\/json/)
        .expect(createMessages(new InternalServerErrorException().message));
      expect(validateProductsInCartService).toHaveBeenCalledTimes(1);
      expect(validateProductsInCartService).toHaveBeenCalledWith(requestBody);
      expect(send).toHaveBeenCalledTimes(1);
      expect(send).toHaveBeenCalledWith(validateProductsInCartPattern, requestBody);
    },
  );

  it(
    createTestName('validate products in cart failed with server error', HttpStatus.INTERNAL_SERVER_ERROR),
    async () => {
      expect.hasAssertions();
      const serverError = new InternalServerErrorException();
      const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => serverError));
      const validateProductsInCartService = jest.spyOn(productService, 'validateProductsInCart');
      await api
        .post(validateProductsInCartUrl)
        .set('mock-session', JSON.stringify(sessionPayload))
        .send(requestBody)
        .expect(HttpStatus.INTERNAL_SERVER_ERROR)
        .expect('Content-Type', /application\/json/)
        .expect(createMessages(serverError.message));
      expect(validateProductsInCartService).toHaveBeenCalledTimes(1);
      expect(validateProductsInCartService).toHaveBeenCalledWith(requestBody);
      expect(send).toHaveBeenCalledTimes(1);
      expect(send).toHaveBeenCalledWith(validateProductsInCartPattern, requestBody);
    },
  );

  it(createTestName('validate products in cart failed with missing field', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const missingTotalFieldRequestBody = {
      carts: requestBody.carts,
    };
    const serverError = new InternalServerErrorException();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => serverError));
    const validateProductsInCartService = jest.spyOn(productService, 'validateProductsInCart');
    const response = await api
      .post(validateProductsInCartUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(missingTotalFieldRequestBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/);
    expect(response.body).toEqual({ messages: expect.any(Array) });
    expect(validateProductsInCartService).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(createTestName('validate products in cart failed with undefine field', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const undefinedFieldRequestBody = {
      ...requestBody,
      userId: Date.now().toString(),
    };
    const serverError = new InternalServerErrorException();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => serverError));
    const validateProductsInCartService = jest.spyOn(productService, 'validateProductsInCart');
    const response = await api
      .post(validateProductsInCartUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(undefinedFieldRequestBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/);
    expect(response.body).toEqual({ messages: expect.any(Array) });
    expect(validateProductsInCartService).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(createTestName('validate products in cart failed with empty request body', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const serverError = new InternalServerErrorException();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => serverError));
    const validateProductsInCartService = jest.spyOn(productService, 'validateProductsInCart');
    const response = await api
      .post(validateProductsInCartUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .send({})
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/);
    expect(response.body).toEqual({ messages: expect.any(Array) });
    expect(validateProductsInCartService).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(createTestName('validate products in cart failed with database disconnect', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new BadRequestException(PrismaDisconnectError.message)));
    const validateProductsInCartService = jest.spyOn(productService, 'validateProductsInCart');
    await api
      .post(validateProductsInCartUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(requestBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.COMMON.DATABASE_DISCONNECT));
    expect(validateProductsInCartService).toHaveBeenCalledTimes(1);
    expect(validateProductsInCartService).toHaveBeenCalledWith(requestBody);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(validateProductsInCartPattern, requestBody);
  });
});

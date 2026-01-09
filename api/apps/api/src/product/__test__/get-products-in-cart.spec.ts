import { of, throwError } from 'rxjs';
import { expect } from '@jest/globals';
import TestAgent from 'supertest/lib/agent';
import { ClientProxy } from '@nestjs/microservices';
import {
  BadRequestException,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  RequestMethod,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import startUp from './pre-setup';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import { getProductsInCartPattern } from '@share/pattern';
import { createProductList, product } from '@share/test/pre-setup/mock/data/product';
import { sessionPayload, user } from '@share/test/pre-setup/mock/data/user';
import { createDescribeTest, createTestName, getMockModule } from '@share/test/helpers';
import ProductService from '../product.service';
import ProductModule from '../product.module';
import ProductController from '../product.controller';
import messages from '@share/constants/messages';
import { HTTP_METHOD } from '@share/enums';
import { PrismaDisconnectError } from '@share/test/pre-setup/mock/errors/prisma-errors';
import { Products, ProductSerializer } from '@share/dto/serializer/product';
import { ProductQuery } from '@share/dto/validators/product.dto';
import { createMessage, createMessages } from '@share/utils';
import { ProductRouter } from '@share/router';
const productsInCartUrl = ProductRouter.absolute.productsInCart;

const MockProductModule = getMockModule(ProductModule, { path: productsInCartUrl, method: RequestMethod.POST });

delete product.ingredients;
const length = 2;
const products = createProductList(length);
const result = instanceToPlain(plainToInstance(ProductSerializer, products));
const userId = user.user_id;
const productIds = products.map((p) => p.product_id);
const body = {
  productIds,
  query: {
    name: true,
    count: true,
    price: true,
    avatar: true,
  },
};

body.query = ProductQuery.plain(body.query) as any;

const payload = {
  userId,
  select: body,
};

let api: TestAgent;
let clientProxy: ClientProxy;
let close: () => Promise<void>;
let productService: ProductService;
let productController: ProductController;

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

describe(createDescribeTest(HTTP_METHOD.POST, productsInCartUrl), () => {
  it(createTestName('get products in cart success', HttpStatus.OK), async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(productController as any, 'logError');
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(products));
    const getProductsInCart = jest.spyOn(productService, 'getProductsInCart');
    await api
      .post(productsInCartUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(body)
      .expect(HttpStatus.OK)
      .expect('Content-Type', /application\/json/)
      .expect(result);
    expect(getProductsInCart).toHaveBeenCalledTimes(1);
    expect(getProductsInCart).toHaveBeenCalledWith(userId, body);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(getProductsInCartPattern, payload);
    expect(logError).not.toHaveBeenCalled();
  });

  it(createTestName('get products in cart failed with authentication error', HttpStatus.UNAUTHORIZED), async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(productController as any, 'logError');
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(products));
    const getProductsInCart = jest.spyOn(productService, 'getProductsInCart');
    await api
      .post(productsInCartUrl)
      .send(body)
      .expect(HttpStatus.UNAUTHORIZED)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.DID_NOT_LOGIN));
    expect(getProductsInCart).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
    expect(logError).not.toHaveBeenCalled();
  });

  it(createTestName('get products in cart failed with output validate', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(productController as any, 'logError');
    const validateErrors = [new ValidationError()];
    jest.spyOn(Products.prototype, 'validate').mockResolvedValue(validateErrors);
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(products));
    const getProductsInCart = jest.spyOn(productService, 'getProductsInCart');
    await api
      .post(productsInCartUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(body)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.COMMON.OUTPUT_VALIDATE));
    expect(getProductsInCart).toHaveBeenCalledTimes(1);
    expect(getProductsInCart).toHaveBeenCalledWith(userId, body);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(getProductsInCartPattern, payload);
    expect(logError).toHaveBeenCalledTimes(1);
    expect(logError).toHaveBeenCalledWith(validateErrors, expect.any(String));
  });

  it(createTestName('get products in cart failed with not found error', HttpStatus.NOT_FOUND), async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(productController as any, 'logError');
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => new NotFoundException([])));
    const getProductsInCart = jest.spyOn(productService, 'getProductsInCart');
    await api
      .post(productsInCartUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(body)
      .expect(HttpStatus.NOT_FOUND)
      .expect('Content-Type', /application\/json/)
      .expect([]);
    expect(getProductsInCart).toHaveBeenCalledTimes(1);
    expect(getProductsInCart).toHaveBeenCalledWith(userId, body);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(getProductsInCartPattern, payload);
    expect(logError).not.toHaveBeenCalled();
  });

  it(createTestName('get products in cart failed with unknown error', HttpStatus.INTERNAL_SERVER_ERROR), async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(productController as any, 'logError');
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => UnknownError));
    const getProductsInCart = jest.spyOn(productService, 'getProductsInCart');
    await api
      .post(productsInCartUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(body)
      .expect(HttpStatus.INTERNAL_SERVER_ERROR)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(new InternalServerErrorException().message));
    expect(getProductsInCart).toHaveBeenCalledTimes(1);
    expect(getProductsInCart).toHaveBeenCalledWith(userId, body);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(getProductsInCartPattern, payload);
    expect(logError).not.toHaveBeenCalled();
  });

  it(createTestName('get products in cart failed with rpc unknown error', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(productController as any, 'logError');
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new BadRequestException(createMessage(messages.COMMON.COMMON_ERROR))));
    const getProductsInCart = jest.spyOn(productService, 'getProductsInCart');
    await api
      .post(productsInCartUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(body)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.COMMON.COMMON_ERROR));
    expect(getProductsInCart).toHaveBeenCalledTimes(1);
    expect(getProductsInCart).toHaveBeenCalledWith(userId, body);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(getProductsInCartPattern, payload);
    expect(logError).not.toHaveBeenCalled();
  });

  it(createTestName('get products in cart failed with server error', HttpStatus.INTERNAL_SERVER_ERROR), async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(productController as any, 'logError');
    const serverError = new InternalServerErrorException();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => serverError));
    const getProductsInCart = jest.spyOn(productService, 'getProductsInCart');
    await api
      .post(productsInCartUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(body)
      .expect(HttpStatus.INTERNAL_SERVER_ERROR)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(serverError.message));
    expect(getProductsInCart).toHaveBeenCalledTimes(1);
    expect(getProductsInCart).toHaveBeenCalledWith(userId, body);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(getProductsInCartPattern, payload);
    expect(logError).not.toHaveBeenCalled();
  });

  it(createTestName('get products in cart failed with missing query field', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(productController as any, 'logError');
    const missingQueryFieldBody = {
      productIds: body.productIds,
    };
    const send = jest.spyOn(clientProxy, 'send');
    const getProductsInCart = jest.spyOn(productService, 'getProductsInCart');
    const response = await api
      .post(productsInCartUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(missingQueryFieldBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/);
    expect(response.body).toEqual({ messages: expect.any(Array) });
    expect(getProductsInCart).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
    expect(logError).not.toHaveBeenCalled();
  });

  it(createTestName('get products in cart failed with undefined field', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(productController as any, 'logError');
    const undefinedFieldRequestBody = {
      ...body,
      productId: Date.now().toString(),
    };
    const send = jest.spyOn(clientProxy, 'send');
    const pagination = jest.spyOn(productService, 'pagination');
    const response = await api
      .post(productsInCartUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(undefinedFieldRequestBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/);
    expect(response.body).toEqual({ messages: expect.any(Array) });
    expect(pagination).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
    expect(logError).not.toHaveBeenCalled();
  });

  it(createTestName('pagination product failed with database disconnect', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(productController as any, 'logError');
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new BadRequestException(PrismaDisconnectError.message)));
    const getProductsInCart = jest.spyOn(productService, 'getProductsInCart');
    await api
      .post(productsInCartUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(body)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.COMMON.DATABASE_DISCONNECT));
    expect(getProductsInCart).toHaveBeenCalledTimes(1);
    expect(getProductsInCart).toHaveBeenCalledWith(userId, body);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(getProductsInCartPattern, payload);
    expect(logError).not.toHaveBeenCalled();
  });

  it(createTestName('get products in cart success with empty query', HttpStatus.OK), async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(productController as any, 'logError');
    const emptyQueryRequestBody = {
      ...body,
      query: {},
    };
    const payload = {
      userId: user.user_id,
      select: {
        ...body,
        query: {
          product_id: true,
          name: true,
          count: true,
          price: true,
          original_price: true,
          status: true,
          expired_time: true,
          category: true,
          category_id: true,
          _count: {
            select: {
              bill_detail: true,
            },
          },
        },
      },
    };
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(products));
    const getProductsInCart = jest.spyOn(productService, 'getProductsInCart');
    await api
      .post(productsInCartUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(emptyQueryRequestBody)
      .expect(HttpStatus.OK)
      .expect('Content-Type', /application\/json/)
      .expect(result);
    expect(getProductsInCart).toHaveBeenCalledTimes(1);
    expect(getProductsInCart).toHaveBeenCalledWith(userId, payload.select);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(getProductsInCartPattern, payload);
    expect(logError).not.toHaveBeenCalled();
  });
});

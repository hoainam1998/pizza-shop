import {
  BadRequestException,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  RequestMethod,
} from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { expect } from '@jest/globals';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { ValidationError } from 'class-validator';
import { ClientProxy } from '@nestjs/microservices';
import TestAgent from 'supertest/lib/agent';
import startUp from './pre-setup';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import { PrismaDisconnectError } from '@share/test/pre-setup/mock/errors/prisma-errors';
import { getProductPattern } from '@share/pattern';
import { product } from '@share/test/pre-setup/mock/data/product';
import { sessionPayload } from '@share/test/pre-setup/mock/data/user';
import { createDescribeTest, createTestName, getMockModule } from '@share/test/helpers';
import ProductService from '../product.service';
import ProductController from '../product.controller';
import ProductModule from '../product.module';
import messages from '@share/constants/messages';
import { HTTP_METHOD } from '@share/enums';
import { createMessage, createMessages } from '@share/utils';
import { ProductSerializer } from '@share/dto/serializer/product';
import { GetProduct, ProductQuery } from '@share/dto/validators/product.dto';
import { ProductRouter } from '@share/router';
delete product.ingredients;
const getProductUrl: string = ProductRouter.absolute.detail;

const MockProductModule = getMockModule(ProductModule, { path: getProductUrl, method: RequestMethod.POST });

const getProductRequestBody = {
  productId: Date.now().toString(),
  query: {
    name: true,
    count: true,
    price: true,
    status: true,
    categoryId: true,
    ingredients: {
      unit: true,
      count: true,
      name: true,
      avatar: true,
    },
    avatar: true,
    originalPrice: true,
    expiredTime: true,
  },
};
const body = instanceToPlain(plainToInstance(GetProduct, getProductRequestBody));
const query = ProductQuery.plain(body.query);
const select = {
  productId: getProductRequestBody.productId,
  query: query,
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

describe(createDescribeTest(HTTP_METHOD.POST, getProductUrl), () => {
  it(createTestName('get product detail success', HttpStatus.OK), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(product));
    const getProductService = jest.spyOn(productService, 'getProduct');
    await api
      .post(getProductUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(getProductRequestBody)
      .expect(HttpStatus.OK)
      .expect('Content-Type', /application\/json/)
      .expect(instanceToPlain(plainToInstance(ProductSerializer, product)));
    expect(getProductService).toHaveBeenCalledTimes(1);
    expect(getProductService).toHaveBeenCalledWith(select);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(getProductPattern, select);
  });

  it(createTestName('get product detail failed with authentication error', HttpStatus.UNAUTHORIZED), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(product));
    const getProductService = jest.spyOn(productService, 'getProduct');
    await api
      .post(getProductUrl)
      .send(getProductRequestBody)
      .expect(HttpStatus.UNAUTHORIZED)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.DID_NOT_LOGIN));
    expect(getProductService).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(createTestName('get product detail failed with output validate', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const validatorErrors = [new ValidationError()];
    const logError = jest.spyOn(productController as any, 'logError').mockImplementation(() => jest.fn());
    jest.spyOn(ProductSerializer.prototype, 'validate').mockResolvedValue(validatorErrors);
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(product));
    const getProductService = jest.spyOn(productService, 'getProduct');
    await api
      .post(getProductUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(getProductRequestBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.COMMON.OUTPUT_VALIDATE));
    expect(getProductService).toHaveBeenCalledTimes(1);
    expect(getProductService).toHaveBeenCalledWith(select);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(getProductPattern, select);
    expect(logError).toHaveBeenCalledTimes(1);
    expect(logError).toHaveBeenCalledWith(validatorErrors, expect.any(String));
  });

  it(createTestName('get product detail failed with not found error', HttpStatus.NOT_FOUND), async () => {
    expect.hasAssertions();
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new NotFoundException(createMessage(messages.PRODUCT.NOT_FOUND))));
    const getProductService = jest.spyOn(productService, 'getProduct');
    await api
      .post(getProductUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(getProductRequestBody)
      .expect(HttpStatus.NOT_FOUND)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.PRODUCT.NOT_FOUND));
    expect(getProductService).toHaveBeenCalledTimes(1);
    expect(getProductService).toHaveBeenCalledWith(select);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(getProductPattern, select);
  });

  it(createTestName('get product detail failed with unknown error', HttpStatus.INTERNAL_SERVER_ERROR), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => UnknownError));
    const getProductService = jest.spyOn(productService, 'getProduct');
    await api
      .post(getProductUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(getProductRequestBody)
      .expect(HttpStatus.INTERNAL_SERVER_ERROR)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(new InternalServerErrorException().message));
    expect(getProductService).toHaveBeenCalledTimes(1);
    expect(getProductService).toHaveBeenCalledWith(select);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(getProductPattern, select);
  });

  it(createTestName('get product detail failed with server error', HttpStatus.INTERNAL_SERVER_ERROR), async () => {
    expect.hasAssertions();
    const serverError = new InternalServerErrorException();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => serverError));
    const getProductService = jest.spyOn(productService, 'getProduct');
    await api
      .post(getProductUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(getProductRequestBody)
      .expect(HttpStatus.INTERNAL_SERVER_ERROR)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(serverError.message));
    expect(getProductService).toHaveBeenCalledTimes(1);
    expect(getProductService).toHaveBeenCalledWith(select);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(getProductPattern, select);
  });

  it(createTestName('get product detail failed with missing field', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const missingQueryFieldBody = {
      productId: getProductRequestBody.productId,
    };
    const send = jest.spyOn(clientProxy, 'send');
    const getProductService = jest.spyOn(productService, 'getProduct');
    const response = await api
      .post(getProductUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(missingQueryFieldBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/);
    expect(response.body).toEqual({ messages: expect.any(Array) });
    expect(getProductService).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(createTestName('get product detail failed with undefined field', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const undefinedFieldBody = {
      ...getProductRequestBody,
      productIds: [Date.now().toString()],
    };
    const send = jest.spyOn(clientProxy, 'send');
    const getProductService = jest.spyOn(productService, 'getProduct');
    const response = await api
      .post(getProductUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(undefinedFieldBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/);
    expect(response.body).toEqual({ messages: expect.any(Array) });
    expect(getProductService).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(createTestName('get product detail success with empty query field', HttpStatus.OK), async () => {
    expect.hasAssertions();
    const queryFieldEmptyBody = {
      productId: getProductRequestBody.productId,
      query: {},
    };
    const body = instanceToPlain(plainToInstance(GetProduct, queryFieldEmptyBody));
    const query = ProductQuery.plain(body.query);
    const select = {
      productId: getProductRequestBody.productId,
      query: query,
    };
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(product));
    const getProductService = jest.spyOn(productService, 'getProduct');
    await api
      .post(getProductUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(queryFieldEmptyBody)
      .expect(HttpStatus.OK)
      .expect('Content-Type', /application\/json/);
    expect(getProductService).toHaveBeenCalledTimes(1);
    expect(getProductService).toHaveBeenCalledWith(select);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(getProductPattern, select);
  });

  it(createTestName('get product detail failed with undefined field', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const undefinedFieldBody = {
      ...getProductRequestBody,
      productIds: [Date.now().toString()],
    };
    const send = jest.spyOn(clientProxy, 'send');
    const getProductService = jest.spyOn(productService, 'pagination');
    const response = await api
      .post(getProductUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(undefinedFieldBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/);
    expect(response.body).toEqual({ messages: expect.any(Array) });
    expect(getProductService).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(createTestName('get product failed with database disconnect', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new BadRequestException(PrismaDisconnectError.message)));
    const getProductService = jest.spyOn(productService, 'getProduct');
    await api
      .post(getProductUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(getProductRequestBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.COMMON.DATABASE_DISCONNECT));
    expect(getProductService).toHaveBeenCalledTimes(1);
    expect(getProductService).toHaveBeenCalledWith(select);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(getProductPattern, select);
  });
});

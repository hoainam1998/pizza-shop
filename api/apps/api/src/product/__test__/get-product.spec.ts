import { BadRequestException, HttpStatus, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { expect } from '@jest/globals';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { ClientProxy } from '@nestjs/microservices';
import TestAgent from 'supertest/lib/agent';
import startUp from './pre-setup';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import { PrismaDisconnectError } from '@share/test/pre-setup/mock/errors/prisma-errors';
import { getProductPattern } from '@share/pattern';
import { product } from '@share/test/pre-setup/mock/data/product';
import { createDescribeTest, createTestName } from '@share/test/helpers';
import ProductService from '../product.service';
import messages from '@share/constants/messages';
import { HTTP_METHOD } from '@share/enums';
import { createMessage } from '@share/utils';
import { ProductSerializer } from '@share/dto/serializer/product';
import { GetProduct, ProductQuery } from '@share/dto/validators/product.dto';
delete product.ingredients;
const getProductUrl: string = '/product/detail';

const getProductRequestBody = {
  productId: Date.now().toString(),
  query: {
    name: true,
    count: true,
    price: true,
    status: true,
    categoryId: true,
    ingredients: true,
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

describe(createDescribeTest(HTTP_METHOD.POST, getProductUrl), () => {
  let api: TestAgent;
  let clientProxy: ClientProxy;
  let close: () => Promise<void>;
  let productService: ProductService;

  beforeEach(async () => {
    const requestTest = await startUp();
    api = requestTest.api;
    clientProxy = requestTest.clientProxy;
    close = () => requestTest.app.close();
    productService = requestTest.app.get(ProductService);
  });

  afterEach(async () => {
    if (close) {
      await close();
    }
  });

  it(createTestName('get product detail success', HttpStatus.OK), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(product));
    const getProductService = jest.spyOn(productService, 'getProduct');
    await api
      .post(getProductUrl)
      .send(getProductRequestBody)
      .expect(HttpStatus.OK)
      .expect('Content-Type', /application\/json/)
      .expect(instanceToPlain(plainToInstance(ProductSerializer, product)));
    expect(getProductService).toHaveBeenCalledTimes(1);
    expect(getProductService).toHaveBeenCalledWith(select);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(getProductPattern, select);
  });

  it(createTestName('get product detail failed with output validate', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new BadRequestException(createMessage(messages.COMMON.OUTPUT_VALIDATE))));
    const getProductService = jest.spyOn(productService, 'getProduct');
    await api
      .post(getProductUrl)
      .send(getProductRequestBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect({
        message: messages.COMMON.OUTPUT_VALIDATE,
      });
    expect(getProductService).toHaveBeenCalledTimes(1);
    expect(getProductService).toHaveBeenCalledWith(select);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(getProductPattern, select);
  });

  it(createTestName('get category detail failed with not found error', HttpStatus.NOT_FOUND), async () => {
    expect.hasAssertions();
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new NotFoundException(createMessage(messages.PRODUCT.NOT_FOUND))));
    const getProductService = jest.spyOn(productService, 'getProduct');
    await api
      .post(getProductUrl)
      .send(getProductRequestBody)
      .expect(HttpStatus.NOT_FOUND)
      .expect('Content-Type', /application\/json/)
      .expect({
        message: messages.PRODUCT.NOT_FOUND,
      });
    expect(getProductService).toHaveBeenCalledTimes(1);
    expect(getProductService).toHaveBeenCalledWith(select);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(getProductPattern, select);
  });

  it(createTestName('get product detail failed with unknown error', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => UnknownError));
    const getProductService = jest.spyOn(productService, 'getProduct');
    await api
      .post(getProductUrl)
      .send(getProductRequestBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect({
        message: UnknownError.message,
      });
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
      .send(getProductRequestBody)
      .expect(HttpStatus.INTERNAL_SERVER_ERROR)
      .expect('Content-Type', /application\/json/)
      .expect({
        message: serverError.message,
      });
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
      .send(missingQueryFieldBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/);
    expect(response.body).toEqual(expect.any(Array));
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
      .send(undefinedFieldBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/);
    expect(response.body).toEqual(expect.any(Array));
    expect(getProductService).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(createTestName('get product detail failed with empty query field', HttpStatus.BAD_REQUEST), async () => {
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
      .send(undefinedFieldBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/);
    expect(response.body).toEqual(expect.any(Array));
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
      .send(getProductRequestBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect({
        message: messages.COMMON.DATABASE_DISCONNECT,
      });
    expect(getProductService).toHaveBeenCalledTimes(1);
    expect(getProductService).toHaveBeenCalledWith(select);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(getProductPattern, select);
  });
});

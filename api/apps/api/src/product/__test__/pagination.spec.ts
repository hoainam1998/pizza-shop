import { of, throwError } from 'rxjs';
import { expect } from '@jest/globals';
import TestAgent from 'supertest/lib/agent';
import { ClientProxy } from '@nestjs/microservices';
import startUp from './pre-setup';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import { paginationPattern } from '@share/pattern';
import { createProductList } from '@share/test/pre-setup/mock/data/product';
import { createDescribeTest, createTestName } from '@share/test/helpers';
import ProductService from '../product.service';
import { BadRequestException, HttpStatus, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import messages from '@share/constants/messages';
import { HTTP_METHOD } from '@share/enums';
import { PrismaDisconnectError } from '@share/test/pre-setup/mock/errors/prisma-errors';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { PaginationProductSerializer } from '@share/dto/serializer/product';
import { ProductQueryTransform, ProductSelect } from '@share/dto/validators/product.dto';
import { createMessages } from '@share/utils';
import { ValidationError } from 'class-validator';
import ProductController from '../product.controller';
import { ProductRouter } from '@share/router';
const productPaginationUrl = ProductRouter.absolute.pagination;

const paginationBody = {
  pageSize: 10,
  pageNumber: 1,
  query: {
    name: true,
    count: true,
    price: true,
    originalPrice: true,
    status: true,
    expiredTime: true,
    category: true,
    disabled: true,
  },
};

const length = 2;
const paginationResponse = {
  list: createProductList(length),
  total: length,
};

const select = instanceToPlain(plainToInstance(ProductSelect, paginationBody));
const query: any = plainToInstance(ProductQueryTransform, select.query);
select.query = query;

let api: TestAgent;
let clientProxy: ClientProxy;
let close: () => Promise<void>;
let productService: ProductService;
let productController: ProductController;

beforeEach(async () => {
  const requestTest = await startUp();
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

describe(createDescribeTest(HTTP_METHOD.POST, productPaginationUrl), () => {
  it(createTestName('pagination product success', HttpStatus.OK), async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(productController as any, 'logError');
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(paginationResponse));
    const paginationResult = plainToInstance(PaginationProductSerializer, paginationResponse);
    const pagination = jest.spyOn(productService, 'pagination');
    await api
      .post(productPaginationUrl)
      .send(paginationBody)
      .expect(HttpStatus.OK)
      .expect('Content-Type', /application\/json/)
      .expect(instanceToPlain(paginationResult, { exposeUnsetFields: false }));
    expect(pagination).toHaveBeenCalledTimes(1);
    expect(pagination).toHaveBeenCalledWith(select);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(paginationPattern, select);
    expect(logError).not.toHaveBeenCalled();
  });

  it(createTestName('pagination product failed with output validate', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(productController as any, 'logError');
    const validateErrors = [new ValidationError()];
    jest.spyOn(PaginationProductSerializer.prototype, 'validate').mockResolvedValue(validateErrors);
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(paginationResponse));
    const pagination = jest.spyOn(productService, 'pagination');
    await api
      .post(productPaginationUrl)
      .send(paginationBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.COMMON.OUTPUT_VALIDATE));
    expect(pagination).toHaveBeenCalledTimes(1);
    expect(pagination).toHaveBeenCalledWith(select);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(paginationPattern, select);
    expect(logError).toHaveBeenCalledTimes(1);
    expect(logError).toHaveBeenCalledWith(validateErrors, expect.any(String));
  });

  it(createTestName('pagination product failed with not found error', HttpStatus.NOT_FOUND), async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(productController as any, 'logError');
    const notFoundResponse = {
      list: [],
      total: 0,
    };
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new NotFoundException(notFoundResponse)));
    const pagination = jest.spyOn(productService, 'pagination');
    await api
      .post(productPaginationUrl)
      .send(paginationBody)
      .expect(HttpStatus.NOT_FOUND)
      .expect('Content-Type', /application\/json/)
      .expect(notFoundResponse);
    expect(pagination).toHaveBeenCalledTimes(1);
    expect(pagination).toHaveBeenCalledWith(select);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(paginationPattern, select);
    expect(logError).not.toHaveBeenCalled();
  });

  it(createTestName('pagination product failed with unknown error', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(productController as any, 'logError');
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => UnknownError));
    const pagination = jest.spyOn(productService, 'pagination');
    await api
      .post(productPaginationUrl)
      .send(paginationBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(UnknownError.message));
    expect(pagination).toHaveBeenCalledTimes(1);
    expect(pagination).toHaveBeenCalledWith(select);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(paginationPattern, select);
    expect(logError).not.toHaveBeenCalled();
  });

  it(createTestName('pagination product failed with server error', HttpStatus.INTERNAL_SERVER_ERROR), async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(productController as any, 'logError');
    const serverError = new InternalServerErrorException();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => serverError));
    const pagination = jest.spyOn(productService, 'pagination');
    await api
      .post(productPaginationUrl)
      .send(paginationBody)
      .expect(HttpStatus.INTERNAL_SERVER_ERROR)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(serverError.message));
    expect(pagination).toHaveBeenCalledTimes(1);
    expect(pagination).toHaveBeenCalledWith(select);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(paginationPattern, select);
    expect(logError).not.toHaveBeenCalled();
  });

  it(createTestName('pagination product failed with missing query field', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(productController as any, 'logError');
    const missingQueryFieldBody = {
      pageSize: paginationBody.pageSize,
      pageNumber: paginationBody.pageNumber,
    };
    const send = jest.spyOn(clientProxy, 'send');
    const pagination = jest.spyOn(productService, 'pagination');
    const response = await api
      .post(productPaginationUrl)
      .send(missingQueryFieldBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/);
    expect(response.body).toEqual({ messages: expect.any(Array) });
    expect(pagination).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
    expect(logError).not.toHaveBeenCalled();
  });

  it(createTestName('pagination product failed with undefined field', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(productController as any, 'logError');
    const undefinedFieldRequestBody = {
      pageSize: paginationBody.pageSize,
      pageNumber: paginationBody.pageNumber,
      query: paginationBody.query,
      categoryId: Date.now().toString(),
    };
    const send = jest.spyOn(clientProxy, 'send');
    const pagination = jest.spyOn(productService, 'pagination');
    const response = await api
      .post(productPaginationUrl)
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
    const pagination = jest.spyOn(productService, 'pagination');
    await api
      .post(productPaginationUrl)
      .send(paginationBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.COMMON.DATABASE_DISCONNECT));
    expect(pagination).toHaveBeenCalledTimes(1);
    expect(pagination).toHaveBeenCalledWith(select);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(paginationPattern, select);
    expect(logError).not.toHaveBeenCalled();
  });

  it(createTestName('pagination product success with empty query', HttpStatus.OK), async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(productController as any, 'logError');
    const paginationEmptyQueryRequestBody = {
      ...paginationBody,
      query: {},
    };
    const finalPaginationRequestBody = {
      ...paginationBody,
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
    };
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(paginationResponse));
    const pagination = jest.spyOn(productService, 'pagination');
    const paginationResult = plainToInstance(PaginationProductSerializer, paginationResponse);
    await api
      .post(productPaginationUrl)
      .send(paginationEmptyQueryRequestBody)
      .expect(HttpStatus.OK)
      .expect('Content-Type', /application\/json/)
      .expect(instanceToPlain(paginationResult, { exposeUnsetFields: false }));
    expect(pagination).toHaveBeenCalledTimes(1);
    expect(pagination).toHaveBeenCalledWith(finalPaginationRequestBody);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(paginationPattern, finalPaginationRequestBody);
    expect(logError).not.toHaveBeenCalled();
  });
});

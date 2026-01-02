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
import { paginationForSalePattern } from '@share/pattern';
import { createProductList, product } from '@share/test/pre-setup/mock/data/product';
import { sessionPayload } from '@share/test/pre-setup/mock/data/user';
import { createDescribeTest, createTestName, getMockModule } from '@share/test/helpers';
import ProductService from '../product.service';
import ProductModule from '../product.module';
import ProductController from '../product.controller';
import messages from '@share/constants/messages';
import { HTTP_METHOD } from '@share/enums';
import { PrismaDisconnectError } from '@share/test/pre-setup/mock/errors/prisma-errors';
import { PaginationProductSerializer } from '@share/dto/serializer/product';
import { ProductPaginationForSale, ProductQuery } from '@share/dto/validators/product.dto';
import { createMessages } from '@share/utils';
import { ProductRouter } from '@share/router';
const productPaginationForSaleUrl = ProductRouter.absolute.paginationForSale;

const MockProductModule = getMockModule(ProductModule, {
  path: productPaginationForSaleUrl,
  method: RequestMethod.POST,
});

const paginationBody = {
  pageNumber: 1,
  query: {
    name: true,
    avatar: true,
    count: true,
    price: true,
    status: true,
    bought: true,
    ingredients: {
      unit: true,
      name: true,
      count: true,
      avatar: true,
    },
  },
};

const length = 2;
const paginationResponse = {
  list: createProductList(length),
  total: length,
};

const select = instanceToPlain(plainToInstance(ProductPaginationForSale, paginationBody), { exposeUnsetFields: true });
const query = ProductQuery.plain(select.query) as any;
select.query = query;

const payload = {
  select,
  userId: sessionPayload?.userId,
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

describe(createDescribeTest(HTTP_METHOD.POST, productPaginationForSaleUrl), () => {
  it(createTestName('pagination for sale success', HttpStatus.OK), async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(productController as any, 'logError');
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(paginationResponse));
    const paginationResult = plainToInstance(PaginationProductSerializer, paginationResponse);
    const pagination = jest.spyOn(productService, 'paginationForSale');
    await api
      .post(productPaginationForSaleUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(paginationBody)
      .expect(HttpStatus.OK)
      .expect('Content-Type', /application\/json/)
      .expect(instanceToPlain(paginationResult, { exposeUnsetFields: false, groups: ['bought'] }));
    expect(pagination).toHaveBeenCalledTimes(1);
    expect(pagination).toHaveBeenCalledWith(sessionPayload?.userId, select);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(paginationForSalePattern, payload);
    expect(logError).not.toHaveBeenCalled();
  });

  it(createTestName('pagination for sale failed with authentication error', HttpStatus.UNAUTHORIZED), async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(productController as any, 'logError');
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(paginationResponse));
    const pagination = jest.spyOn(productService, 'paginationForSale');
    await api
      .post(productPaginationForSaleUrl)
      .send(paginationBody)
      .expect(HttpStatus.UNAUTHORIZED)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.DID_NOT_LOGIN));
    expect(pagination).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
    expect(logError).not.toHaveBeenCalled();
  });

  it(createTestName('pagination for sale failed with output validate', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(productController as any, 'logError');
    const validateErrors = [new ValidationError()];
    jest.spyOn(PaginationProductSerializer.prototype, 'validate').mockResolvedValue(validateErrors);
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(paginationResponse));
    const pagination = jest.spyOn(productService, 'paginationForSale');
    await api
      .post(productPaginationForSaleUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(paginationBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.COMMON.OUTPUT_VALIDATE));
    expect(pagination).toHaveBeenCalledTimes(1);
    expect(pagination).toHaveBeenCalledWith(sessionPayload?.userId, select);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(paginationForSalePattern, payload);
    expect(logError).toHaveBeenCalledTimes(1);
    expect(logError).toHaveBeenCalledWith(validateErrors, expect.any(String));
  });

  it(createTestName('pagination for sale failed with not found error', HttpStatus.NOT_FOUND), async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(productController as any, 'logError');
    const notFoundResponse = {
      list: [],
      total: 0,
    };
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new NotFoundException(notFoundResponse)));
    const pagination = jest.spyOn(productService, 'paginationForSale');
    await api
      .post(productPaginationForSaleUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(paginationBody)
      .expect(HttpStatus.NOT_FOUND)
      .expect('Content-Type', /application\/json/)
      .expect(notFoundResponse);
    expect(pagination).toHaveBeenCalledTimes(1);
    expect(pagination).toHaveBeenCalledWith(sessionPayload?.userId, select);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(paginationForSalePattern, payload);
    expect(logError).not.toHaveBeenCalled();
  });

  it(createTestName('pagination for sale failed with unknown error', HttpStatus.INTERNAL_SERVER_ERROR), async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(productController as any, 'logError');
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => UnknownError));
    const pagination = jest.spyOn(productService, 'paginationForSale');
    await api
      .post(productPaginationForSaleUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(paginationBody)
      .expect(HttpStatus.INTERNAL_SERVER_ERROR)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(new InternalServerErrorException().message));
    expect(pagination).toHaveBeenCalledTimes(1);
    expect(pagination).toHaveBeenCalledWith(sessionPayload?.userId, select);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(paginationForSalePattern, payload);
    expect(logError).not.toHaveBeenCalled();
  });

  it(createTestName('pagination for sale failed with server error', HttpStatus.INTERNAL_SERVER_ERROR), async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(productController as any, 'logError');
    const serverError = new InternalServerErrorException();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => serverError));
    const pagination = jest.spyOn(productService, 'paginationForSale');
    await api
      .post(productPaginationForSaleUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(paginationBody)
      .expect(HttpStatus.INTERNAL_SERVER_ERROR)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(serverError.message));
    expect(pagination).toHaveBeenCalledTimes(1);
    expect(pagination).toHaveBeenCalledWith(sessionPayload?.userId, select);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(paginationForSalePattern, payload);
    expect(logError).not.toHaveBeenCalled();
  });

  it(createTestName('pagination for sale failed with missing query field', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(productController as any, 'logError');
    const missingQueryFieldBody = {
      pageNumber: paginationBody.pageNumber,
    };
    const send = jest.spyOn(clientProxy, 'send');
    const pagination = jest.spyOn(productService, 'paginationForSale');
    const response = await api
      .post(productPaginationForSaleUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(missingQueryFieldBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/);
    expect(response.body).toEqual({ messages: expect.any(Array) });
    expect(pagination).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
    expect(logError).not.toHaveBeenCalled();
  });

  it(createTestName('pagination for sale failed with undefined field', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(productController as any, 'logError');
    const undefinedFieldRequestBody = {
      pageNumber: paginationBody.pageNumber,
      query: paginationBody.query,
      search: product.name,
      categoryId: Date.now().toString(),
      unknown: Date.now().toString(),
    };
    const send = jest.spyOn(clientProxy, 'send');
    const pagination = jest.spyOn(productService, 'paginationForSale');
    const response = await api
      .post(productPaginationForSaleUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(undefinedFieldRequestBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/);
    expect(response.body).toEqual({ messages: expect.any(Array) });
    expect(pagination).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
    expect(logError).not.toHaveBeenCalled();
  });

  it(createTestName('pagination for sale failed with database disconnect', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(productController as any, 'logError');
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new BadRequestException(PrismaDisconnectError.message)));
    const pagination = jest.spyOn(productService, 'paginationForSale');
    await api
      .post(productPaginationForSaleUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(paginationBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.COMMON.DATABASE_DISCONNECT));
    expect(pagination).toHaveBeenCalledTimes(1);
    expect(pagination).toHaveBeenCalledWith(sessionPayload?.userId, select);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(paginationForSalePattern, payload);
    expect(logError).not.toHaveBeenCalled();
  });

  it(createTestName('pagination for sale success with empty query', HttpStatus.OK), async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(productController as any, 'logError');
    const paginationEmptyQueryRequestBody = {
      ...paginationBody,
      query: {},
    };
    const finalPaginationRequestBody = {
      ...paginationBody,
      pageSize: 10,
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
    const pagination = jest.spyOn(productService, 'paginationForSale');
    const paginationResult = plainToInstance(PaginationProductSerializer, paginationResponse);
    await api
      .post(productPaginationForSaleUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(paginationEmptyQueryRequestBody)
      .expect(HttpStatus.OK)
      .expect('Content-Type', /application\/json/)
      .expect(instanceToPlain(paginationResult, { exposeUnsetFields: false, groups: ['disabled', 'bought'] }));

    expect(pagination).toHaveBeenCalledTimes(1);
    expect(pagination).toHaveBeenCalledWith(sessionPayload?.userId, finalPaginationRequestBody);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(paginationForSalePattern, {
      userId: sessionPayload?.userId,
      select: finalPaginationRequestBody,
    });
    expect(logError).not.toHaveBeenCalled();
  });
});

import { of, throwError } from 'rxjs';
import { expect } from '@jest/globals';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import TestAgent from 'supertest/lib/agent';
import { ClientProxy } from '@nestjs/microservices';
import startUp from './pre-setup';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import { updateProductPattern } from '@share/pattern';
import { product } from '@share/test/pre-setup/mock/data/product';
import { sessionPayload, user } from '@share/test/pre-setup/mock/data/user';
import { getStaticFile, createDescribeTest, createTestName, getMockModule } from '@share/test/helpers';
import ProductService from '../product.service';
import ProductModule from '../product.module';
import {
  BadRequestException,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  RequestMethod,
} from '@nestjs/common';
import messages from '@share/constants/messages';
import { HTTP_METHOD } from '@share/enums';
import { PrismaDisconnectError } from '@share/test/pre-setup/mock/errors/prisma-errors';
import { ProductCreate, ProductCreateTransform } from '@share/dto/validators/product.dto';
import { createMessages } from '@share/utils';
import { ProductRouter } from '@share/router';
import { EventsGateway } from '@share/libs/socket/event-socket.gateway';
const updateProductUrl = ProductRouter.absolute.update;

const MockProductModule = getMockModule(ProductModule, { path: updateProductUrl, method: RequestMethod.PUT });

const productRequestBody = {
  productId: product.product_id,
  name: product.name,
  avatar: product.avatar,
  count: product.count,
  price: product.price,
  originalPrice: product.original_price,
  expiredTime: product.expired_time,
  category: product.category_id,
  ingredients: product.ingredients,
};

const userIds = [user.user_id];

const productBody = instanceToPlain(plainToInstance(ProductCreate, productRequestBody), {
  exposeUnsetFields: false,
});
const productUpdate: any = instanceToPlain(plainToInstance(ProductCreateTransform, productBody));
productUpdate.avatar = expect.toBeImageBase64();

let api: TestAgent;
let clientProxy: ClientProxy;
let close: () => Promise<void>;
let productService: ProductService;
let socketGateway: EventsGateway;

beforeEach(async () => {
  const requestTest = await startUp(MockProductModule);
  api = requestTest.api;
  clientProxy = requestTest.clientProxy;
  close = () => requestTest.app.close();
  productService = requestTest.app.get(ProductService);
  socketGateway = requestTest.app.get(EventsGateway);
});

afterEach(async () => {
  if (close) {
    await close();
  }
});

describe(createDescribeTest(HTTP_METHOD.PUT, updateProductUrl), () => {
  it(createTestName('update product success', HttpStatus.CREATED), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(userIds));
    const updateProduct = jest.spyOn(productService, 'updateProduct');
    const refreshCurrentInfo = jest.spyOn(socketGateway, 'refreshCurrentInfo').mockImplementation(jest.fn());
    await api
      .put(updateProductUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .field('productId', product.product_id)
      .field('name', product.name)
      .field('count', product.count)
      .field('price', product.price)
      .field('originalPrice', product.original_price)
      .field('expiredTime', product.expired_time)
      .field('category', product.category_id)
      .field('ingredients', product.ingredients)
      .attach('avatar', getStaticFile('test-image.png'))
      .expect(HttpStatus.CREATED)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.PRODUCT.UPDATE_PRODUCT_SUCCESS));
    expect(updateProduct).toHaveBeenCalledTimes(1);
    expect(updateProduct).toHaveBeenCalledWith(productUpdate);
    expect(refreshCurrentInfo).toHaveBeenCalledTimes(userIds.length);
    expect(refreshCurrentInfo.mock.calls).toEqual([userIds]);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(updateProductPattern, productUpdate);
  });

  it(createTestName('update product failed with authentication error', HttpStatus.UNAUTHORIZED), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(userIds));
    const refreshCurrentInfo = jest.spyOn(socketGateway, 'refreshCurrentInfo');
    const updateProduct = jest.spyOn(productService, 'updateProduct');
    await api
      .put(updateProductUrl)
      .set('Connection', 'keep-alive')
      .field('productId', product.product_id)
      .field('name', product.name)
      .field('count', product.count)
      .field('price', product.price)
      .field('originalPrice', product.original_price)
      .field('expiredTime', product.expired_time)
      .field('category', product.category_id)
      .field('ingredients', product.ingredients)
      .attach('avatar', getStaticFile('test-image.png'))
      .expect(HttpStatus.UNAUTHORIZED)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.DID_NOT_LOGIN));
    expect(updateProduct).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
    expect(refreshCurrentInfo).not.toHaveBeenCalled();
  });

  it(createTestName('update product failed with undefined field', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(product));
    const updateProduct = jest.spyOn(productService, 'updateProduct');
    const refreshCurrentInfo = jest.spyOn(socketGateway, 'refreshCurrentInfo');
    const response = await api
      .put(updateProductUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .field('categoryIds', Date.now().toString())
      .field('productId', product.product_id)
      .field('name', product.name)
      .field('count', product.count)
      .field('price', product.price)
      .field('originalPrice', product.original_price)
      .field('expiredTime', product.expired_time)
      .field('category', product.category_id)
      .field('ingredients', product.ingredients)
      .attach('avatar', getStaticFile('test-image.png'))
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/);
    expect(response.body).toEqual(createMessages(expect.any(String)));
    expect(updateProduct).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
    expect(refreshCurrentInfo).not.toHaveBeenCalled();
  });

  it(createTestName('update product failed with count field is zero value', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(product));
    const refreshCurrentInfo = jest.spyOn(socketGateway, 'refreshCurrentInfo');
    const updateProduct = jest.spyOn(productService, 'updateProduct');
    const response = await api
      .put(updateProductUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .field('productId', product.product_id)
      .field('name', product.name)
      .field('count', 0)
      .field('price', product.price)
      .field('originalPrice', product.original_price)
      .field('expiredTime', product.expired_time)
      .field('category', product.category_id)
      .field('ingredients', product.ingredients)
      .attach('avatar', getStaticFile('test-image.png'))
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/);
    expect(response.body).toEqual(createMessages('count must be a positive number'));
    expect(updateProduct).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
    expect(refreshCurrentInfo).not.toHaveBeenCalled();
  });

  it(createTestName('update product failed with price field is zero value', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(product));
    const refreshCurrentInfo = jest.spyOn(socketGateway, 'refreshCurrentInfo');
    const updateProduct = jest.spyOn(productService, 'updateProduct');
    const response = await api
      .put(updateProductUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .field('productId', product.product_id)
      .field('name', product.name)
      .field('count', product.count)
      .field('price', 0)
      .field('originalPrice', product.original_price)
      .field('expiredTime', product.expired_time)
      .field('category', product.category_id)
      .field('ingredients', product.ingredients)
      .attach('avatar', getStaticFile('test-image.png'))
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/);
    expect(response.body).toEqual(createMessages('price must be a positive number'));
    expect(updateProduct).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
    expect(refreshCurrentInfo).not.toHaveBeenCalled();
  });

  it(
    createTestName('update product failed with originalPrice field is zero value', HttpStatus.BAD_REQUEST),
    async () => {
      expect.hasAssertions();
      const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(product));
      const updateProduct = jest.spyOn(productService, 'updateProduct');
      const refreshCurrentInfo = jest.spyOn(socketGateway, 'refreshCurrentInfo');
      const response = await api
        .put(updateProductUrl)
        .set('mock-session', JSON.stringify(sessionPayload))
        .field('productId', product.product_id)
        .field('name', product.name)
        .field('count', product.count)
        .field('price', product.price)
        .field('originalPrice', 0)
        .field('expiredTime', product.expired_time)
        .field('category', product.category_id)
        .field('ingredients', product.ingredients)
        .attach('avatar', getStaticFile('test-image.png'))
        .expect(HttpStatus.BAD_REQUEST)
        .expect('Content-Type', /application\/json/);
      expect(response.body).toEqual(createMessages('originalPrice must be a positive number'));
      expect(updateProduct).not.toHaveBeenCalled();
      expect(send).not.toHaveBeenCalled();
      expect(refreshCurrentInfo).not.toHaveBeenCalled();
    },
  );

  it(createTestName('update product failed with unknown error', HttpStatus.INTERNAL_SERVER_ERROR), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => UnknownError));
    const updateProduct = jest.spyOn(productService, 'updateProduct');
    const refreshCurrentInfo = jest.spyOn(socketGateway, 'refreshCurrentInfo');
    await api
      .put(updateProductUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .field('productId', product.product_id)
      .field('name', product.name)
      .field('count', product.count)
      .field('price', product.price)
      .field('originalPrice', product.original_price)
      .field('expiredTime', product.expired_time)
      .field('category', product.category_id)
      .field('ingredients', product.ingredients)
      .attach('avatar', getStaticFile('test-image.png'))
      .expect(HttpStatus.INTERNAL_SERVER_ERROR)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(new InternalServerErrorException().message));
    expect(updateProduct).toHaveBeenCalledTimes(1);
    expect(updateProduct).toHaveBeenCalledWith(productUpdate);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(updateProductPattern, productUpdate);
    expect(refreshCurrentInfo).not.toHaveBeenCalled();
  });

  it(createTestName('update product failed with not found error', HttpStatus.NOT_FOUND), async () => {
    expect.hasAssertions();
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new NotFoundException(messages.PRODUCT.NOT_FOUND)));
    const refreshCurrentInfo = jest.spyOn(socketGateway, 'refreshCurrentInfo');
    const updateProduct = jest.spyOn(productService, 'updateProduct');
    await api
      .put(updateProductUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .field('productId', product.product_id)
      .field('name', product.name)
      .field('count', product.count)
      .field('price', product.price)
      .field('originalPrice', product.original_price)
      .field('expiredTime', product.expired_time)
      .field('category', product.category_id)
      .field('ingredients', product.ingredients)
      .attach('avatar', getStaticFile('test-image.png'))
      .expect(HttpStatus.NOT_FOUND)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.PRODUCT.NOT_FOUND));
    expect(updateProduct).toHaveBeenCalledTimes(1);
    expect(updateProduct).toHaveBeenCalledWith(productUpdate);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(updateProductPattern, productUpdate);
    expect(refreshCurrentInfo).not.toHaveBeenCalled();
  });

  it(createTestName('update product failed with avatar empty', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const errorMessage = messages.COMMON.EMPTY_FILE.replace(/{fieldname}/, 'avatar');
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(product));
    const updateProduct = jest.spyOn(productService, 'updateProduct');
    const refreshCurrentInfo = jest.spyOn(socketGateway, 'refreshCurrentInfo');
    await api
      .put(updateProductUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .field('productId', product.product_id)
      .field('name', product.name)
      .field('count', product.count)
      .field('price', product.price)
      .field('originalPrice', product.original_price)
      .field('expiredTime', product.expired_time)
      .field('category', product.category_id)
      .field('ingredients', product.ingredients)
      .attach('avatar', getStaticFile('empty.png'))
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(errorMessage));
    expect(updateProduct).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
    expect(refreshCurrentInfo).not.toHaveBeenCalled();
  });

  it(createTestName('update product failed with avatar wrong type', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(product));
    const updateProduct = jest.spyOn(productService, 'updateProduct');
    const refreshCurrentInfo = jest.spyOn(socketGateway, 'refreshCurrentInfo');
    await api
      .put(updateProductUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .field('productId', product.product_id)
      .field('name', product.name)
      .field('count', product.count)
      .field('price', product.price)
      .field('originalPrice', product.original_price)
      .field('expiredTime', product.expired_time)
      .field('category', product.category_id)
      .field('ingredients', product.ingredients)
      .attach('avatar', getStaticFile('favicon.ico'))
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.COMMON.FILE_TYPE_INVALID));
    expect(updateProduct).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
    expect(refreshCurrentInfo).not.toHaveBeenCalled();
  });

  it(createTestName('update product failed with missing avatar field', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(product));
    const updateProduct = jest.spyOn(productService, 'updateProduct');
    const refreshCurrentInfo = jest.spyOn(socketGateway, 'refreshCurrentInfo');
    const response = await api
      .put(updateProductUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .field('productId', product.product_id)
      .field('name', product.name)
      .field('count', product.count)
      .field('price', product.price)
      .field('originalPrice', product.original_price)
      .field('expiredTime', product.expired_time)
      .field('category', product.category_id)
      .field('ingredients', product.ingredients)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/);
    expect(response.body).toEqual(createMessages(expect.any(String)));
    expect(updateProduct).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
    expect(refreshCurrentInfo).not.toHaveBeenCalled();
  });

  it(createTestName('update product failed with missing productId field', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(product));
    const refreshCurrentInfo = jest.spyOn(socketGateway, 'refreshCurrentInfo');
    const updateProduct = jest.spyOn(productService, 'updateProduct');
    const response = await api
      .put(updateProductUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .field('name', product.name)
      .field('count', product.count)
      .field('price', product.price)
      .field('originalPrice', product.original_price)
      .field('expiredTime', product.expired_time)
      .field('category', product.category_id)
      .field('ingredients', product.ingredients)
      .attach('avatar', getStaticFile('test-image.png'))
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/);
    expect(response.body).toEqual({ messages: expect.any(Array) });
    expect(updateProduct).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
    expect(refreshCurrentInfo).not.toHaveBeenCalled();
  });

  it(createTestName('update product failed with database disconnect', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new BadRequestException(PrismaDisconnectError.message)));
    const refreshCurrentInfo = jest.spyOn(socketGateway, 'refreshCurrentInfo');
    const updateProduct = jest.spyOn(productService, 'updateProduct');
    await api
      .put(updateProductUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .field('productId', product.product_id)
      .field('name', product.name)
      .field('count', product.count)
      .field('price', product.price)
      .field('originalPrice', product.original_price)
      .field('expiredTime', product.expired_time)
      .field('category', product.category_id)
      .field('ingredients', product.ingredients)
      .attach('avatar', getStaticFile('test-image.png'))
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.COMMON.DATABASE_DISCONNECT));
    expect(updateProduct).toHaveBeenCalledTimes(1);
    expect(updateProduct).toHaveBeenCalledWith(productUpdate);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(updateProductPattern, productUpdate);
    expect(refreshCurrentInfo).not.toHaveBeenCalled();
  });

  it(createTestName('update product failed with server error', HttpStatus.INTERNAL_SERVER_ERROR), async () => {
    expect.hasAssertions();
    const serverError = new InternalServerErrorException();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => serverError));
    const refreshCurrentInfo = jest.spyOn(socketGateway, 'refreshCurrentInfo');
    const updateProduct = jest.spyOn(productService, 'updateProduct');
    await api
      .put(updateProductUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .field('productId', product.product_id)
      .field('name', product.name)
      .field('count', product.count)
      .field('price', product.price)
      .field('originalPrice', product.original_price)
      .field('expiredTime', product.expired_time)
      .field('category', product.category_id)
      .field('ingredients', product.ingredients)
      .attach('avatar', getStaticFile('test-image.png'))
      .expect(HttpStatus.INTERNAL_SERVER_ERROR)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(serverError.message));
    expect(updateProduct).toHaveBeenCalledTimes(1);
    expect(updateProduct).toHaveBeenCalledWith(productUpdate);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(updateProductPattern, productUpdate);
    expect(refreshCurrentInfo).not.toHaveBeenCalled();
  });
});

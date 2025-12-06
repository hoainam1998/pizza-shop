import { of, throwError } from 'rxjs';
import { expect } from '@jest/globals';
import TestAgent from 'supertest/lib/agent';
import { ClientProxy } from '@nestjs/microservices';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import startUp from './pre-setup';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import { createProductPattern } from '@share/pattern';
import { product } from '@share/test/pre-setup/mock/data/product';
import { getStaticFile, createDescribeTest, createTestName } from '@share/test/helpers';
import ProductService from '../product.service';
import { BadRequestException, HttpStatus, InternalServerErrorException } from '@nestjs/common';
import messages from '@share/constants/messages';
import { HTTP_METHOD } from '@share/enums';
import { PrismaDisconnectError } from '@share/test/pre-setup/mock/errors/prisma-errors';
import { ProductCreate, ProductCreateTransform } from '@share/dto/validators/product.dto';
import { createMessages } from '@share/utils';
import { ProductRouter } from '@share/router';
const createProductUrl = ProductRouter.absolute.create;

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

describe(createDescribeTest(HTTP_METHOD.POST, createProductUrl), () => {
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

  const productBody = instanceToPlain(plainToInstance(ProductCreate, productRequestBody));
  const productCreate: any = plainToInstance(ProductCreateTransform, productBody, { groups: ['create'] });
  productCreate.avatar = expect.toBeImageBase64();

  it(createTestName('create product success', HttpStatus.CREATED), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(product));
    const createProduct = jest.spyOn(productService, 'createProduct');
    await api
      .post(createProductUrl)
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
      .expect(createMessages(messages.PRODUCT.CREATE_PRODUCT_SUCCESS));
    expect(createProduct).toHaveBeenCalledTimes(1);
    expect(createProduct).toHaveBeenCalledWith(productCreate);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(createProductPattern, productCreate);
  });

  it(createTestName('create product failed with undefined field', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(product));
    const createProduct = jest.spyOn(productService, 'createProduct');
    const response = await api
      .post(createProductUrl)
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
    expect(response.body).toEqual({ messages: expect.any(Array) });
    expect(createProduct).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(createTestName('create product failed with unknown error', HttpStatus.INTERNAL_SERVER_ERROR), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => UnknownError));
    const createProduct = jest.spyOn(productService, 'createProduct');
    await api
      .post(createProductUrl)
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
    expect(createProduct).toHaveBeenCalledTimes(1);
    expect(createProduct).toHaveBeenCalledWith(productCreate);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(createProductPattern, productCreate);
  });

  it(createTestName('create product failed with count field is zero value', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockImplementation(() => throwError(() => UnknownError));
    const createProduct = jest.spyOn(productService, 'createProduct');
    const response = await api
      .post(createProductUrl)
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
    expect(createProduct).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(createTestName('create product failed with price field is zero value', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockImplementation(() => throwError(() => UnknownError));
    const createProduct = jest.spyOn(productService, 'createProduct');
    const response = await api
      .post(createProductUrl)
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
    expect(createProduct).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(
    createTestName('create product failed with originalPrice field is zero value', HttpStatus.BAD_REQUEST),
    async () => {
      expect.hasAssertions();
      const send = jest.spyOn(clientProxy, 'send').mockImplementation(() => throwError(() => UnknownError));
      const createProduct = jest.spyOn(productService, 'createProduct');
      const response = await api
        .post(createProductUrl)
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
      expect(createProduct).not.toHaveBeenCalled();
      expect(send).not.toHaveBeenCalled();
    },
  );

  it(createTestName('create product failed with avatar empty', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const errorMessage = messages.COMMON.EMPTY_FILE.replace(/{fieldname}/, 'avatar');
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(product));
    const createProduct = jest.spyOn(productService, 'createProduct');
    await api
      .post(createProductUrl)
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
    expect(createProduct).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(createTestName('create product failed with avatar wrong type', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(product));
    const createProduct = jest.spyOn(productService, 'createProduct');
    await api
      .post(createProductUrl)
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
    expect(createProduct).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(createTestName('create product failed with missing avatar field', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(product));
    const createProduct = jest.spyOn(productService, 'createProduct');
    const response = await api
      .post(createProductUrl)
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
    expect(createProduct).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(createTestName('create product failed with missing productId field', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(product));
    const createProduct = jest.spyOn(productService, 'createProduct');
    const response = await api
      .post(createProductUrl)
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
    expect(createProduct).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(createTestName('create product failed with database disconnect', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new BadRequestException(PrismaDisconnectError.message)));
    const createProduct = jest.spyOn(productService, 'createProduct');
    await api
      .post(createProductUrl)
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
    expect(createProduct).toHaveBeenCalledTimes(1);
    expect(createProduct).toHaveBeenCalledWith(productCreate);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(createProductPattern, productCreate);
  });

  it(createTestName('create product failed with server error', HttpStatus.INTERNAL_SERVER_ERROR), async () => {
    expect.hasAssertions();
    const serverError = new InternalServerErrorException();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => serverError));
    const createProduct = jest.spyOn(productService, 'createProduct');
    await api
      .post(createProductUrl)
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
    expect(createProduct).toHaveBeenCalledTimes(1);
    expect(createProduct).toHaveBeenCalledWith(productCreate);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(createProductPattern, productCreate);
  });
});

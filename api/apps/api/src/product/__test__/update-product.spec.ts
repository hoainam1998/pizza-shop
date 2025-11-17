import { of, throwError } from 'rxjs';
import { expect } from '@jest/globals';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import TestAgent from 'supertest/lib/agent';
import { ClientProxy } from '@nestjs/microservices';
import startUp from './pre-setup';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import { updateProductPattern } from '@share/pattern';
import { product } from '@share/test/pre-setup/mock/data/product';
import { getStaticFile, createDescribeTest, createTestName } from '@share/test/helpers';
import ProductService from '../product.service';
import { BadRequestException, HttpStatus, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import messages from '@share/constants/messages';
import { HTTP_METHOD } from '@share/enums';
import { PrismaDisconnectError } from '@share/test/pre-setup/mock/errors/prisma-errors';
import { ProductCreate, ProductCreateTransform } from '@share/dto/validators/product.dto';
import { createMessages } from '@share/utils';
import { ProductRouter } from '@share/router';
const updateProductUrl = ProductRouter.absolute.update;

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

const productBody = instanceToPlain(plainToInstance(ProductCreate, productRequestBody), {
  exposeUnsetFields: false,
});
const productUpdate: any = instanceToPlain(plainToInstance(ProductCreateTransform, productBody));
productUpdate.avatar = expect.toBeImageBase64();

describe(createDescribeTest(HTTP_METHOD.PUT, updateProductUrl), () => {
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

  it(createTestName('update product success', HttpStatus.CREATED), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(product));
    const updateProduct = jest.spyOn(productService, 'updateProduct');
    await api
      .put(updateProductUrl)
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
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(updateProductPattern, productUpdate);
  });

  it(createTestName('update product failed with undefined field', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(product));
    const updateProduct = jest.spyOn(productService, 'updateProduct');
    const response = await api
      .put(updateProductUrl)
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
  });

  it(createTestName('update product failed with count field is zero value', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(product));
    const updateProduct = jest.spyOn(productService, 'updateProduct');
    const response = await api
      .put(updateProductUrl)
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
  });

  it(createTestName('update product failed with price field is zero value', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(product));
    const updateProduct = jest.spyOn(productService, 'updateProduct');
    const response = await api
      .put(updateProductUrl)
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
  });

  it(
    createTestName('update product failed with originalPrice field is zero value', HttpStatus.BAD_REQUEST),
    async () => {
      expect.hasAssertions();
      const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(product));
      const updateProduct = jest.spyOn(productService, 'updateProduct');
      const response = await api
        .put(updateProductUrl)
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
    },
  );

  it(createTestName('update product failed with unknown error', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockImplementation(() => throwError(() => UnknownError));
    const updateProduct = jest.spyOn(productService, 'updateProduct');
    await api
      .put(updateProductUrl)
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
      .expect(createMessages(UnknownError.message));
    expect(updateProduct).toHaveBeenCalledTimes(1);
    expect(updateProduct).toHaveBeenCalledWith(productUpdate);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(updateProductPattern, productUpdate);
  });

  it(createTestName('update product failed with not found error', HttpStatus.NOT_FOUND), async () => {
    expect.hasAssertions();
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new NotFoundException(messages.PRODUCT.NOT_FOUND)));
    const updateProduct = jest.spyOn(productService, 'updateProduct');
    await api
      .put(updateProductUrl)
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
  });

  it(createTestName('update product failed with avatar empty', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const errorMessage = messages.COMMON.EMPTY_FILE.replace(/{fieldname}/, 'avatar');
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(product));
    const updateProduct = jest.spyOn(productService, 'updateProduct');
    await api
      .put(updateProductUrl)
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
  });

  it(createTestName('update product failed with avatar wrong type', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(product));
    const updateProduct = jest.spyOn(productService, 'updateProduct');
    await api
      .put(updateProductUrl)
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
  });

  it(createTestName('update product failed with missing avatar field', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(product));
    const updateProduct = jest.spyOn(productService, 'updateProduct');
    const response = await api
      .put(updateProductUrl)
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
  });

  it(createTestName('update product failed with missing productId field', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(product));
    const updateProduct = jest.spyOn(productService, 'updateProduct');
    const response = await api
      .put(updateProductUrl)
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
  });

  it(createTestName('update product failed with database disconnect', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new BadRequestException(PrismaDisconnectError.message)));
    const updateProduct = jest.spyOn(productService, 'updateProduct');
    await api
      .put(updateProductUrl)
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
  });

  it(createTestName('update product failed with server error', HttpStatus.INTERNAL_SERVER_ERROR), async () => {
    expect.hasAssertions();
    const serverError = new InternalServerErrorException();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => serverError));
    const updateProduct = jest.spyOn(productService, 'updateProduct');
    await api
      .put(updateProductUrl)
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
  });
});

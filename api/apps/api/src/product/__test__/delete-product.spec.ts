import { BadRequestException, HttpStatus, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import TestAgent from 'supertest/lib/agent';
import { expect } from '@jest/globals';
import { ClientProxy } from '@nestjs/microservices';
import startUp from './pre-setup';
import { deleteProductPattern } from '@share/pattern';
import { product } from '@share/test/pre-setup/mock/data/product';
import { createDescribeTest, createTestName } from '@share/test/helpers';
import ProductService from '../product.service';
import messages from '@share/constants/messages';
import { HTTP_METHOD } from '@share/enums';
import { PrismaDisconnectError } from '@share/test/pre-setup/mock/errors/prisma-errors';
const deleteProductBaseUrl = '/product/delete';
const productId: string = Date.now().toString();
const deleteProductUrl: string = `${deleteProductBaseUrl}/${productId}`;

describe(createDescribeTest(HTTP_METHOD.DELETE, deleteProductBaseUrl), () => {
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

  it(createTestName('delete product success', HttpStatus.OK), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(product));
    const deleteProduct = jest.spyOn(productService, 'deleteProduct');
    await api
      .delete(deleteProductUrl)
      .expect(HttpStatus.OK)
      .expect('Content-Type', /application\/json/)
      .expect({
        message: messages.PRODUCT.DELETE_PRODUCT_SUCCESS,
      });
    expect(deleteProduct).toHaveBeenCalledTimes(1);
    expect(deleteProduct).toHaveBeenCalledWith(productId);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(deleteProductPattern, productId);
  });

  it(createTestName('delete product failed with invalid id', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(product));
    const deleteProduct = jest.spyOn(productService, 'deleteProduct');
    await api
      .delete('/product/delete/xzy')
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect({
        message: messages.COMMON.VALIDATE_ID_FAIL,
      });
    expect(deleteProduct).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(createTestName('delete product failed with unknown error', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new BadRequestException(messages.COMMON.COMMON_ERROR)));
    const deleteProduct = jest.spyOn(productService, 'deleteProduct');
    await api
      .delete(deleteProductUrl)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect({
        message: messages.COMMON.COMMON_ERROR,
      });
    expect(deleteProduct).toHaveBeenCalledTimes(1);
    expect(deleteProduct).toHaveBeenCalledWith(productId);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(deleteProductPattern, productId);
  });

  it(createTestName('delete product failed with not found error', HttpStatus.NOT_FOUND), async () => {
    expect.hasAssertions();
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new NotFoundException(messages.PRODUCT.NOT_FOUND)));
    const deleteProduct = jest.spyOn(productService, 'deleteProduct');
    await api
      .delete(deleteProductUrl)
      .expect(HttpStatus.NOT_FOUND)
      .expect('Content-Type', /application\/json/)
      .expect({
        message: messages.PRODUCT.NOT_FOUND,
      });
    expect(deleteProduct).toHaveBeenCalledTimes(1);
    expect(deleteProduct).toHaveBeenCalledWith(productId);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(deleteProductPattern, productId);
  });

  it(createTestName('delete product failed with database disconnect error', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new BadRequestException(PrismaDisconnectError.message)));
    const deleteProduct = jest.spyOn(productService, 'deleteProduct');
    await api
      .delete(deleteProductUrl)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect({
        message: messages.COMMON.DATABASE_DISCONNECT,
      });
    expect(deleteProduct).toHaveBeenCalledTimes(1);
    expect(deleteProduct).toHaveBeenCalledWith(productId);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(deleteProductPattern, productId);
  });

  it(createTestName('delete product failed with server error', HttpStatus.INTERNAL_SERVER_ERROR), async () => {
    expect.hasAssertions();
    const serverError = new InternalServerErrorException();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => serverError));
    const deleteProduct = jest.spyOn(productService, 'deleteProduct');
    await api
      .delete(deleteProductUrl)
      .expect(HttpStatus.INTERNAL_SERVER_ERROR)
      .expect('Content-Type', /application\/json/)
      .expect({
        message: serverError.message,
      });
    expect(deleteProduct).toHaveBeenCalledTimes(1);
    expect(deleteProduct).toHaveBeenCalledWith(productId);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(deleteProductPattern, productId);
  });
});

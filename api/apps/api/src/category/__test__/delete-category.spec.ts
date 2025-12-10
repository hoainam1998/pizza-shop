import {
  BadRequestException,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  RequestMethod,
} from '@nestjs/common';
import { of, throwError } from 'rxjs';
import TestAgent from 'supertest/lib/agent';
import { expect } from '@jest/globals';
import { ClientProxy } from '@nestjs/microservices';
import startUp from './pre-setup';
import { deleteCategoryPattern } from '@share/pattern';
import { category } from '@share/test/pre-setup/mock/data/category';
import { sessionPayload } from '@share/test/pre-setup/mock/data/user';
import { createDescribeTest, createTestName, getMockModule } from '@share/test/helpers';
import CategoryService from '../category.service';
import CategoryModule from '../category.module';
import messages from '@share/constants/messages';
import { HTTP_METHOD } from '@share/enums';
import { PrismaDisconnectError } from '@share/test/pre-setup/mock/errors/prisma-errors';
import { createMessages } from '@share/utils';
import { CategoryRouter } from '@share/router';
const deleteCategoryBaseUrl = CategoryRouter.absolute.delete;
const categoryId: string = Date.now().toString();
const deleteCategoryUrl: string = `${deleteCategoryBaseUrl}/${categoryId}`;

const MockCategoryModule = getMockModule(CategoryModule, {
  path: `${deleteCategoryBaseUrl}/*`,
  method: RequestMethod.DELETE,
});

let api: TestAgent;
let clientProxy: ClientProxy;
let close: () => Promise<void>;
let categoryService: CategoryService;

beforeEach(async () => {
  const requestTest = await startUp(MockCategoryModule);
  api = requestTest.api;
  clientProxy = requestTest.clientProxy;
  close = () => requestTest.app.close();
  categoryService = requestTest.app.get(CategoryService);
});

afterEach(async () => {
  if (close) {
    await close();
  }
});

describe(createDescribeTest(HTTP_METHOD.DELETE, deleteCategoryBaseUrl), () => {
  it(createTestName('delete category success', HttpStatus.OK), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(category));
    const deleteCategory = jest.spyOn(categoryService, 'deleteCategory');
    await api
      .delete(deleteCategoryUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .expect(HttpStatus.OK)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.CATEGORY.DELETE_CATEGORY_SUCCESS));
    expect(deleteCategory).toHaveBeenCalledTimes(1);
    expect(deleteCategory).toHaveBeenCalledWith(categoryId);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(deleteCategoryPattern, categoryId);
  });

  it(createTestName('delete category failed with authentication error', HttpStatus.UNAUTHORIZED), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(category));
    const deleteCategory = jest.spyOn(categoryService, 'deleteCategory');
    await api
      .delete(deleteCategoryUrl)
      .expect(HttpStatus.UNAUTHORIZED)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.DID_NOT_LOGIN));
    expect(deleteCategory).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(createTestName('delete category failed with invalid id', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(category));
    const deleteCategory = jest.spyOn(categoryService, 'deleteCategory');
    await api
      .delete('/category/delete/xzy')
      .set('mock-session', JSON.stringify(sessionPayload))
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.COMMON.VALIDATE_ID_FAIL));
    expect(deleteCategory).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(createTestName('delete category failed with unknown error', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new BadRequestException(messages.COMMON.COMMON_ERROR)));
    const deleteCategory = jest.spyOn(categoryService, 'deleteCategory');
    await api
      .delete(deleteCategoryUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.COMMON.COMMON_ERROR));
    expect(deleteCategory).toHaveBeenCalledTimes(1);
    expect(deleteCategory).toHaveBeenCalledWith(categoryId);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(deleteCategoryPattern, categoryId);
  });

  it(createTestName('delete category failed with not found error', HttpStatus.NOT_FOUND), async () => {
    expect.hasAssertions();
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new NotFoundException(messages.PRODUCT.NOT_FOUND)));
    const deleteCategory = jest.spyOn(categoryService, 'deleteCategory');
    await api
      .delete(deleteCategoryUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .expect(HttpStatus.NOT_FOUND)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.PRODUCT.NOT_FOUND));
    expect(deleteCategory).toHaveBeenCalledTimes(1);
    expect(deleteCategory).toHaveBeenCalledWith(categoryId);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(deleteCategoryPattern, categoryId);
  });

  it(createTestName('delete category failed with database disconnect error', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new BadRequestException(PrismaDisconnectError.message)));
    const deleteCategory = jest.spyOn(categoryService, 'deleteCategory');
    await api
      .delete(deleteCategoryUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.COMMON.DATABASE_DISCONNECT));
    expect(deleteCategory).toHaveBeenCalledTimes(1);
    expect(deleteCategory).toHaveBeenCalledWith(categoryId);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(deleteCategoryPattern, categoryId);
  });

  it(createTestName('delete category failed with server error', HttpStatus.INTERNAL_SERVER_ERROR), async () => {
    expect.hasAssertions();
    const serverError = new InternalServerErrorException();
    const send = jest.spyOn(clientProxy, 'send').mockImplementation(() => throwError(() => serverError));
    const deleteCategory = jest.spyOn(categoryService, 'deleteCategory');
    await api
      .delete(deleteCategoryUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .expect(HttpStatus.INTERNAL_SERVER_ERROR)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(serverError.message));
    expect(deleteCategory).toHaveBeenCalledTimes(1);
    expect(deleteCategory).toHaveBeenCalledWith(categoryId);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(deleteCategoryPattern, categoryId);
  });
});

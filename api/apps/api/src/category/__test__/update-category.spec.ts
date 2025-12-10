import { of, throwError } from 'rxjs';
import { expect } from '@jest/globals';
import {
  BadRequestException,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  RequestMethod,
} from '@nestjs/common';
import TestAgent from 'supertest/lib/agent';
import { ClientProxy } from '@nestjs/microservices';
import startUp from './pre-setup';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import { updateCategoryPattern } from '@share/pattern';
import { category } from '@share/test/pre-setup/mock/data/category';
import { sessionPayload } from '@share/test/pre-setup/mock/data/user';
import { getStaticFile, createDescribeTest, createTestName, getMockModule } from '@share/test/helpers';
import CategoryService from '../category.service';
import CategoryModule from '../category.module';
import messages from '@share/constants/messages';
import { HTTP_METHOD } from '@share/enums';
import { PrismaDisconnectError } from '@share/test/pre-setup/mock/errors/prisma-errors';
import { createMessages } from '@share/utils';
import { CategoryRouter } from '@share/router';
const updateCategoryUrl = CategoryRouter.absolute.update;

const MockCategoryModule = getMockModule(CategoryModule, { path: updateCategoryUrl, method: RequestMethod.PUT });

const categoryResponse = {
  category_id: Date.now().toString(),
  name: category.name,
  avatar: expect.toBeImageBase64(),
};

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

describe(createDescribeTest(HTTP_METHOD.POST, updateCategoryUrl), () => {
  it(createTestName('update category success', HttpStatus.CREATED), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(category));
    const updateCategory = jest.spyOn(categoryService, 'updateCategory');
    await api
      .put(updateCategoryUrl)
      .set('Connection', 'keep-alive')
      .set('mock-session', JSON.stringify(sessionPayload))
      .field('categoryId', categoryResponse.category_id)
      .field('name', category.name)
      .attach('avatar', getStaticFile('test-image.png'))
      .expect(HttpStatus.CREATED)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.CATEGORY.UPDATE_CATEGORY_SUCCESS));
    expect(updateCategory).toHaveBeenCalledTimes(1);
    expect(updateCategory).toHaveBeenCalledWith(categoryResponse);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(updateCategoryPattern, categoryResponse);
  });

  it(createTestName('update category failed with authentication error', HttpStatus.UNAUTHORIZED), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(category));
    const updateCategory = jest.spyOn(categoryService, 'updateCategory');
    await api
      .put(updateCategoryUrl)
      .set('Connection', 'keep-alive')
      .field('categoryId', categoryResponse.category_id)
      .field('name', category.name)
      .attach('avatar', getStaticFile('test-image.png'))
      .expect(HttpStatus.UNAUTHORIZED)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.DID_NOT_LOGIN));
    expect(updateCategory).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(createTestName('update category failed with undefined field', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(category));
    const updateCategory = jest.spyOn(categoryService, 'updateCategory');
    const response = await api
      .put(updateCategoryUrl)
      .set('Connection', 'keep-alive')
      .set('mock-session', JSON.stringify(sessionPayload))
      .field('categoryIds', Date.now().toString())
      .field('name', category.name)
      .attach('avatar', getStaticFile('test-image.png'))
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/);
    expect(response.body).toEqual({ messages: expect.any(Array) });
    expect(updateCategory).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(createTestName('update category failed with unknown error', HttpStatus.INTERNAL_SERVER_ERROR), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => UnknownError));
    const updateCategory = jest.spyOn(categoryService, 'updateCategory');
    await api
      .put(updateCategoryUrl)
      .set('Connection', 'keep-alive')
      .set('mock-session', JSON.stringify(sessionPayload))
      .field('categoryId', categoryResponse.category_id)
      .field('name', category.name)
      .attach('avatar', getStaticFile('test-image.png'))
      .expect(HttpStatus.INTERNAL_SERVER_ERROR)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(new InternalServerErrorException().message));
    expect(updateCategory).toHaveBeenCalledTimes(1);
    expect(updateCategory).toHaveBeenCalledWith(categoryResponse);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(updateCategoryPattern, categoryResponse);
  });

  it(createTestName('update category failed with not found error', HttpStatus.NOT_FOUND), async () => {
    expect.hasAssertions();
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new NotFoundException(messages.CATEGORY.NOT_FOUND)));
    const updateCategory = jest.spyOn(categoryService, 'updateCategory');
    await api
      .put(updateCategoryUrl)
      .set('Connection', 'keep-alive')
      .set('mock-session', JSON.stringify(sessionPayload))
      .field('categoryId', categoryResponse.category_id)
      .field('name', category.name)
      .attach('avatar', getStaticFile('test-image.png'))
      .expect(HttpStatus.NOT_FOUND)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.CATEGORY.NOT_FOUND));
    expect(updateCategory).toHaveBeenCalledTimes(1);
    expect(updateCategory).toHaveBeenCalledWith(categoryResponse);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(updateCategoryPattern, categoryResponse);
  });

  it(createTestName('update category failed with avatar empty', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const errorMessage = messages.COMMON.EMPTY_FILE.replace(/{fieldname}/, 'avatar');
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(category));
    const createCategory = jest.spyOn(categoryService, 'updateCategory');
    await api
      .put(updateCategoryUrl)
      .set('Connection', 'keep-alive')
      .set('mock-session', JSON.stringify(sessionPayload))
      .field('categoryId', categoryResponse.category_id)
      .field('name', category.name)
      .attach('avatar', getStaticFile('empty.png'))
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(errorMessage));
    expect(createCategory).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(createTestName('update category failed with avatar wrong type', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(category));
    const updateCategory = jest.spyOn(categoryService, 'updateCategory');
    await api
      .put(updateCategoryUrl)
      .set('Connection', 'keep-alive')
      .set('mock-session', JSON.stringify(sessionPayload))
      .field('categoryId', categoryResponse.category_id)
      .field('name', category.name)
      .attach('avatar', getStaticFile('favicon.ico'))
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.COMMON.FILE_TYPE_INVALID));
    expect(updateCategory).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(createTestName('update category failed with missing avatar field', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(category));
    const updateCategory = jest.spyOn(categoryService, 'updateCategory');
    const response = await api
      .put(updateCategoryUrl)
      .set('Connection', 'keep-alive')
      .set('mock-session', JSON.stringify(sessionPayload))
      .field('categoryId', categoryResponse.category_id)
      .field('name', category.name)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/);
    expect(response.body).toEqual(createMessages(expect.any(String)));
    expect(updateCategory).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(createTestName('update category failed with missing name field', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(category));
    const updateCategory = jest.spyOn(categoryService, 'updateCategory');
    const response = await api
      .put(updateCategoryUrl)
      .set('Connection', 'keep-alive')
      .set('mock-session', JSON.stringify(sessionPayload))
      .field('categoryId', categoryResponse.category_id)
      .attach('avatar', getStaticFile('test-image.png'))
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/);
    expect(response.body).toEqual({ messages: expect.any(Array) });
    expect(updateCategory).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(createTestName('update category failed with database disconnect', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new BadRequestException(PrismaDisconnectError.message)));
    const updateCategory = jest.spyOn(categoryService, 'updateCategory');
    await api
      .put(updateCategoryUrl)
      .set('Connection', 'keep-alive')
      .set('mock-session', JSON.stringify(sessionPayload))
      .field('categoryId', categoryResponse.category_id)
      .attach('avatar', getStaticFile('test-image.png'))
      .field('name', category.name)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.COMMON.DATABASE_DISCONNECT));
    expect(updateCategory).toHaveBeenCalledTimes(1);
    expect(updateCategory).toHaveBeenCalledWith(categoryResponse);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(updateCategoryPattern, categoryResponse);
  });

  it(createTestName('update category failed with server error', HttpStatus.INTERNAL_SERVER_ERROR), async () => {
    expect.hasAssertions();
    const serverError = new InternalServerErrorException();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => serverError));
    const updateCategory = jest.spyOn(categoryService, 'updateCategory');
    await api
      .put(updateCategoryUrl)
      .set('Connection', 'keep-alive')
      .set('mock-session', JSON.stringify(sessionPayload))
      .field('categoryId', categoryResponse.category_id)
      .field('name', category.name)
      .attach('avatar', getStaticFile('test-image.png'))
      .expect(HttpStatus.INTERNAL_SERVER_ERROR)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(serverError.message));
    expect(updateCategory).toHaveBeenCalledTimes(1);
    expect(updateCategory).toHaveBeenCalledWith(categoryResponse);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(updateCategoryPattern, categoryResponse);
  });
});

import {
  BadRequestException,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  RequestMethod,
} from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { ValidationError } from 'class-validator';
import { expect } from '@jest/globals';
import { ClientProxy } from '@nestjs/microservices';
import TestAgent from 'supertest/lib/agent';
import startUp from './pre-setup';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import { PrismaDisconnectError } from '@share/test/pre-setup/mock/errors/prisma-errors';
import { filterValidCategoriesPattern } from '@share/pattern';
import { createCategoryList } from '@share/test/pre-setup/mock/data/category';
import { sessionPayload } from '@share/test/pre-setup/mock/data/user';
import { createDescribeTest, createTestName, getMockModule } from '@share/test/helpers';
import CategoryService from '../category.service';
import CategoryController from '../category.controller';
import CategoryModule from '../category.module';
import messages from '@share/constants/messages';
import { HTTP_METHOD } from '@share/enums';
import { Categories, CategoryDetailSerializer } from '@share/dto/serializer/category';
import { createMessage, createMessages } from '@share/utils';
import { CategoryRouter } from '@share/router';
const filterValidCategoriesUrl: string = CategoryRouter.absolute.filterValidCategories;

const MockCategoryModule = getMockModule(CategoryModule, {
  path: filterValidCategoriesUrl,
  method: RequestMethod.POST,
});

const requestBody = {
  name: true,
  avatar: true,
  category_id: true,
};

const categories = createCategoryList(2, false);
const categoriesObj = new Categories(categories);
const result = instanceToPlain(categoriesObj.List);
let api: TestAgent;
let clientProxy: ClientProxy;
let close: () => Promise<void>;
let categoryService: CategoryService;
let categoryController: CategoryController;

beforeEach(async () => {
  const requestTest = await startUp(MockCategoryModule);
  api = requestTest.api;
  clientProxy = requestTest.clientProxy;
  close = () => requestTest.app.close();
  categoryService = requestTest.app.get(CategoryService);
  categoryController = requestTest.app.get(CategoryController);
});

afterEach(async () => {
  if (close) {
    await close();
  }
});

describe(createDescribeTest(HTTP_METHOD.POST, filterValidCategoriesUrl), () => {
  it(createTestName('filter valid categories success', HttpStatus.OK), async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(categoryController as any, 'logError');
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(categories));
    const filterValidCategories = jest.spyOn(categoryService, 'filterValidCategories');
    await api
      .post(filterValidCategoriesUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(requestBody)
      .expect(HttpStatus.OK)
      .expect('Content-Type', /application\/json/)
      .expect(result);
    expect(filterValidCategories).toHaveBeenCalledTimes(1);
    expect(filterValidCategories).toHaveBeenCalledWith(requestBody);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(filterValidCategoriesPattern, requestBody);
    expect(logError).not.toHaveBeenCalled();
  });

  it(createTestName('filter valid categories failed with authentication error', HttpStatus.UNAUTHORIZED), async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(categoryController as any, 'logError');
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(categories));
    const filterValidCategories = jest.spyOn(categoryService, 'filterValidCategories');
    await api
      .post(filterValidCategoriesUrl)
      .send(requestBody)
      .expect(HttpStatus.UNAUTHORIZED)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.DID_NOT_LOGIN));
    expect(filterValidCategories).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
    expect(logError).not.toHaveBeenCalled();
  });

  it(createTestName('filter valid categories failed with output validate', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const validateErrors = [new ValidationError()];
    jest.spyOn(Categories.prototype, 'validate').mockResolvedValue(validateErrors);
    const logError = jest.spyOn(categoryController as any, 'logError').mockImplementation(() => jest.fn());
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(categories));
    const filterValidCategories = jest.spyOn(categoryService, 'filterValidCategories');
    await api
      .post(filterValidCategoriesUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(requestBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.COMMON.OUTPUT_VALIDATE));
    expect(filterValidCategories).toHaveBeenCalledTimes(1);
    expect(filterValidCategories).toHaveBeenCalledWith(requestBody);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(filterValidCategoriesPattern, requestBody);
    expect(logError).toHaveBeenCalledTimes(1);
    expect(logError).toHaveBeenCalledWith(validateErrors, expect.any(String));
  });

  it(createTestName('filter valid categories failed with not found error', HttpStatus.NOT_FOUND), async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(categoryController as any, 'logError');
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => new NotFoundException([])));
    const filterValidCategories = jest.spyOn(categoryService, 'filterValidCategories');
    await api
      .post(filterValidCategoriesUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(requestBody)
      .expect(HttpStatus.NOT_FOUND)
      .expect('Content-Type', /application\/json/)
      .expect([]);
    expect(filterValidCategories).toHaveBeenCalledTimes(1);
    expect(filterValidCategories).toHaveBeenCalledWith(requestBody);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(filterValidCategoriesPattern, requestBody);
    expect(logError).not.toHaveBeenCalled();
  });

  it(
    createTestName('filter valid categories failed with unknown error', HttpStatus.INTERNAL_SERVER_ERROR),
    async () => {
      expect.hasAssertions();
      const logError = jest.spyOn(categoryController as any, 'logError');
      const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => UnknownError));
      const filterValidCategories = jest.spyOn(categoryService, 'filterValidCategories');
      await api
        .post(filterValidCategoriesUrl)
        .set('mock-session', JSON.stringify(sessionPayload))
        .send(requestBody)
        .expect(HttpStatus.INTERNAL_SERVER_ERROR)
        .expect('Content-Type', /application\/json/)
        .expect(createMessages(new InternalServerErrorException().message));
      expect(filterValidCategories).toHaveBeenCalledTimes(1);
      expect(filterValidCategories).toHaveBeenCalledWith(requestBody);
      expect(send).toHaveBeenCalledTimes(1);
      expect(send).toHaveBeenCalledWith(filterValidCategoriesPattern, requestBody);
      expect(logError).not.toHaveBeenCalled();
    },
  );

  it(createTestName('filter valid categories failed with rpc unknown error', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(categoryController as any, 'logError');
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new BadRequestException(messages.COMMON.COMMON_ERROR)));
    const filterValidCategories = jest.spyOn(categoryService, 'filterValidCategories');
    await api
      .post(filterValidCategoriesUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(requestBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.COMMON.COMMON_ERROR));
    expect(filterValidCategories).toHaveBeenCalledTimes(1);
    expect(filterValidCategories).toHaveBeenCalledWith(requestBody);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(filterValidCategoriesPattern, requestBody);
    expect(logError).not.toHaveBeenCalled();
  });

  it(createTestName('filter valid categories failed with server error', HttpStatus.INTERNAL_SERVER_ERROR), async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(categoryController as any, 'logError');
    const serverError = new InternalServerErrorException();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => serverError));
    const filterValidCategories = jest.spyOn(categoryService, 'filterValidCategories');
    await api
      .post(filterValidCategoriesUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(requestBody)
      .expect(HttpStatus.INTERNAL_SERVER_ERROR)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(serverError.message));
    expect(filterValidCategories).toHaveBeenCalledTimes(1);
    expect(filterValidCategories).toHaveBeenCalledWith(requestBody);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(filterValidCategoriesPattern, requestBody);
    expect(logError).not.toHaveBeenCalled();
  });

  it(createTestName('filter valid categories success with empty request body', HttpStatus.OK), async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(categoryController as any, 'logError');
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(categories));
    const filterValidCategories = jest.spyOn(categoryService, 'filterValidCategories');
    const query = {
      ...requestBody,
      _count: {
        select: {
          product: true,
        },
      },
    };
    await api
      .post(filterValidCategoriesUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .send({})
      .expect(HttpStatus.OK)
      .expect(result);
    expect(filterValidCategories).toHaveBeenCalledTimes(1);
    expect(filterValidCategories).toHaveBeenCalledWith(query);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(filterValidCategoriesPattern, query);
    expect(logError).not.toHaveBeenCalled();
  });

  it(createTestName('get all categories failed with undefined field', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(categoryController as any, 'logError');
    const undefinedFieldRequestBody = {
      ...requestBody,
      categoryId: Date.now().toString(),
    };
    const send = jest.spyOn(clientProxy, 'send');
    const filterValidCategories = jest.spyOn(categoryService, 'filterValidCategories');
    const response = await api
      .post(filterValidCategoriesUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(undefinedFieldRequestBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/);
    expect(response.body).toEqual({ messages: expect.any(Array) });
    expect(filterValidCategories).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
    expect(logError).not.toHaveBeenCalled();
  });

  it(createTestName('get all categories failed with database disconnect', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(categoryController as any, 'logError');
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new BadRequestException(PrismaDisconnectError.message)));
    const filterValidCategories = jest.spyOn(categoryService, 'filterValidCategories');
    await api
      .post(filterValidCategoriesUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(requestBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.COMMON.DATABASE_DISCONNECT));
    expect(filterValidCategories).toHaveBeenCalledTimes(1);
    expect(filterValidCategories).toHaveBeenCalledWith(requestBody);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(filterValidCategoriesPattern, requestBody);
    expect(logError).not.toHaveBeenCalled();
  });
});

import { BadRequestException, HttpStatus, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { expect } from '@jest/globals';
import { ClientProxy } from '@nestjs/microservices';
import TestAgent from 'supertest/lib/agent';
import startUp from './pre-setup';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import { PrismaDisconnectError } from '@share/test/pre-setup/mock/errors/prisma-errors';
import { getAllCategoriesPattern } from '@share/pattern';
import { createCategoryList } from '@share/test/pre-setup/mock/data/category';
import { createDescribeTest, createTestName } from '@share/test/helpers';
import CategoryService from '../category.service';
import CategoryController from '../category.controller';
import messages from '@share/constants/messages';
import { HTTP_METHOD } from '@share/enums';
import { Categories, CategoryDetailSerializer } from '@share/dto/serializer/category';
import { createMessages } from '@share/utils';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { ValidationError } from 'class-validator';
const getAllCategoriesUrl: string = '/category/all';

const getAllCategoriesRequestBody = {
  name: true,
  avatar: true,
  category_id: true,
};

const categories = createCategoryList(2, false);
let api: TestAgent;
let clientProxy: ClientProxy;
let close: () => Promise<void>;
let categoryService: CategoryService;
let categoryController: CategoryController;

beforeEach(async () => {
  const requestTest = await startUp();
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

describe(createDescribeTest(HTTP_METHOD.POST, getAllCategoriesUrl), () => {
  it(createTestName('get all categories success', HttpStatus.OK), async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(categoryController as any, 'logError');
    const categoriesObj = new Categories(categories);
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(categories));
    const getAllCategories = jest.spyOn(categoryService, 'getAllCategories');
    await api
      .post(getAllCategoriesUrl)
      .send(getAllCategoriesRequestBody)
      .expect(HttpStatus.OK)
      .expect('Content-Type', /application\/json/)
      .expect(instanceToPlain(plainToInstance(CategoryDetailSerializer, categoriesObj.List)));
    expect(getAllCategories).toHaveBeenCalledTimes(1);
    expect(getAllCategories).toHaveBeenCalledWith(getAllCategoriesRequestBody);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(getAllCategoriesPattern, getAllCategoriesRequestBody);
    expect(logError).not.toHaveBeenCalled();
  });

  it(createTestName('get all categories failed with output validate', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const validateErrors = [new ValidationError()];
    jest.spyOn(Categories.prototype, 'validate').mockResolvedValue(validateErrors);
    const logError = jest.spyOn(categoryController as any, 'logError').mockImplementation(() => jest.fn());
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(categories));
    const getAllCategories = jest.spyOn(categoryService, 'getAllCategories');
    await api
      .post(getAllCategoriesUrl)
      .send(getAllCategoriesRequestBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.COMMON.OUTPUT_VALIDATE));
    expect(getAllCategories).toHaveBeenCalledTimes(1);
    expect(getAllCategories).toHaveBeenCalledWith(getAllCategoriesRequestBody);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(getAllCategoriesPattern, getAllCategoriesRequestBody);
    expect(logError).toHaveBeenCalledTimes(1);
    expect(logError).toHaveBeenCalledWith(validateErrors, expect.any(String));
  });

  it(createTestName('get all categories failed with not found error', HttpStatus.NOT_FOUND), async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(categoryController as any, 'logError');
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => new NotFoundException([])));
    const getAllCategories = jest.spyOn(categoryService, 'getAllCategories');
    await api
      .post(getAllCategoriesUrl)
      .send(getAllCategoriesRequestBody)
      .expect(HttpStatus.NOT_FOUND)
      .expect('Content-Type', /application\/json/)
      .expect([]);
    expect(getAllCategories).toHaveBeenCalledTimes(1);
    expect(getAllCategories).toHaveBeenCalledWith(getAllCategoriesRequestBody);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(getAllCategoriesPattern, getAllCategoriesRequestBody);
    expect(logError).not.toHaveBeenCalled();
  });

  it(createTestName('get all categories failed with unknown error', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(categoryController as any, 'logError');
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => UnknownError));
    const getAllCategories = jest.spyOn(categoryService, 'getAllCategories');
    await api
      .post(getAllCategoriesUrl)
      .send(getAllCategoriesRequestBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(UnknownError.message));
    expect(getAllCategories).toHaveBeenCalledTimes(1);
    expect(getAllCategories).toHaveBeenCalledWith(getAllCategoriesRequestBody);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(getAllCategoriesPattern, getAllCategoriesRequestBody);
    expect(logError).not.toHaveBeenCalled();
  });

  it(createTestName('get all categories failed with server error', HttpStatus.INTERNAL_SERVER_ERROR), async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(categoryController as any, 'logError');
    const serverError = new InternalServerErrorException();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => serverError));
    const getAllCategories = jest.spyOn(categoryService, 'getAllCategories');
    await api
      .post(getAllCategoriesUrl)
      .send(getAllCategoriesRequestBody)
      .expect(HttpStatus.INTERNAL_SERVER_ERROR)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(serverError.message));
    expect(getAllCategories).toHaveBeenCalledTimes(1);
    expect(getAllCategories).toHaveBeenCalledWith(getAllCategoriesRequestBody);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(getAllCategoriesPattern, getAllCategoriesRequestBody);
    expect(logError).not.toHaveBeenCalled();
  });

  it(createTestName('get all categories success with empty request body', HttpStatus.OK), async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(categoryController as any, 'logError');
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(categories));
    const categoriesObj = new Categories(categories);
    const getAllCategories = jest.spyOn(categoryService, 'getAllCategories');
    const query = {
      ...getAllCategoriesRequestBody,
      _count: {
        select: {
          product: true,
        },
      },
    };
    await api
      .post(getAllCategoriesUrl)
      .send({})
      .expect(HttpStatus.OK)
      .expect(instanceToPlain(plainToInstance(CategoryDetailSerializer, categoriesObj.List)));
    expect(getAllCategories).toHaveBeenCalledTimes(1);
    expect(getAllCategories).toHaveBeenCalledWith(query);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(getAllCategoriesPattern, query);
    expect(logError).not.toHaveBeenCalled();
  });

  it(createTestName('get all categories failed with undefined field', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(categoryController as any, 'logError');
    const undefinedFieldRequestBody = {
      ...getAllCategoriesRequestBody,
      categoryId: Date.now().toString(),
    };
    const send = jest.spyOn(clientProxy, 'send');
    const getAllCategories = jest.spyOn(categoryService, 'getAllCategories');
    const response = await api
      .post(getAllCategoriesUrl)
      .send(undefinedFieldRequestBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/);
    expect(response.body).toEqual({ messages: expect.any(Array) });
    expect(getAllCategories).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
    expect(logError).not.toHaveBeenCalled();
  });

  it(createTestName('get all categories failed with database disconnect', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(categoryController as any, 'logError');
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new BadRequestException(PrismaDisconnectError.message)));
    const getAllCategories = jest.spyOn(categoryService, 'getAllCategories');
    await api
      .post(getAllCategoriesUrl)
      .send(getAllCategoriesRequestBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.COMMON.DATABASE_DISCONNECT));
    expect(getAllCategories).toHaveBeenCalledTimes(1);
    expect(getAllCategories).toHaveBeenCalledWith(getAllCategoriesRequestBody);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(getAllCategoriesPattern, getAllCategoriesRequestBody);
    expect(logError).not.toHaveBeenCalled();
  });
});

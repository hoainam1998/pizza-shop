import { BadRequestException, HttpStatus, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { expect } from '@jest/globals';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { ClientProxy } from '@nestjs/microservices';
import TestAgent from 'supertest/lib/agent';
import startUp from './pre-setup';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import { PrismaDisconnectError } from '@share/test/pre-setup/mock/errors/prisma-errors';
import { paginationPattern } from '@share/pattern';
import { createCategoryList } from '@share/test/pre-setup/mock/data/category';
import { createDescribeTest, createTestName } from '@share/test/helpers';
import CategoryService from '../category.service';
import messages from '@share/constants/messages';
import { HTTP_METHOD } from '@share/enums';
import { CategoryPaginationFormatter } from '@share/dto/serializer/category';
import { createMessages } from '@share/utils';
import { ValidationError } from 'class-validator';
import CategoryController from '../category.controller';
const paginationCategoryUrl: string = '/category/pagination';

const paginationBody = {
  pageSize: 10,
  pageNumber: 1,
  query: {
    name: true,
    avatar: true,
    disabled: true,
  },
};

const paginationBodyWidthId = {
  ...paginationBody,
  query: {
    name: paginationBody.query.name,
    avatar: paginationBody.query.avatar,
    category_id: true,
    _count: {
      select: {
        product: true,
      },
    },
  },
};

const length: number = 2;
const responseData = {
  list: createCategoryList(length),
  total: length,
};

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

describe(createDescribeTest(HTTP_METHOD.POST, paginationCategoryUrl), () => {
  it(createTestName('pagination category success', HttpStatus.OK), async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(categoryController as any, 'logError');
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(responseData));
    const paginationService = jest.spyOn(categoryService, 'pagination');
    await api
      .post(paginationCategoryUrl)
      .send(paginationBody)
      .expect(HttpStatus.OK)
      .expect('Content-Type', /application\/json/)
      .expect(instanceToPlain(plainToInstance(CategoryPaginationFormatter, responseData)));
    expect(paginationService).toHaveBeenCalledTimes(1);
    expect(paginationService).toHaveBeenCalledWith(paginationBodyWidthId);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(paginationPattern, paginationBodyWidthId);
    expect(logError).not.toHaveBeenCalled();
  });

  it(createTestName('pagination category failed with output validate', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const validateErrors = [new ValidationError()];
    const logError = jest.spyOn(categoryController as any, 'logError');
    jest.spyOn(CategoryPaginationFormatter.prototype, 'validate').mockResolvedValue(validateErrors);
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(responseData));
    const paginationService = jest.spyOn(categoryService, 'pagination');
    await api
      .post(paginationCategoryUrl)
      .send(paginationBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.COMMON.OUTPUT_VALIDATE));
    expect(paginationService).toHaveBeenCalledTimes(1);
    expect(paginationService).toHaveBeenCalledWith(paginationBodyWidthId);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(paginationPattern, paginationBodyWidthId);
    expect(logError).toHaveBeenCalledTimes(1);
    expect(logError).toHaveBeenCalledWith(validateErrors, expect.any(String));
  });

  it(createTestName('pagination category failed with not found error', HttpStatus.NOT_FOUND), async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(categoryController as any, 'logError');
    const notFoundResponse = {
      list: [],
      total: 0,
    };
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new NotFoundException(notFoundResponse)));
    const paginationService = jest.spyOn(categoryService, 'pagination');
    await api
      .post(paginationCategoryUrl)
      .send(paginationBody)
      .expect(HttpStatus.NOT_FOUND)
      .expect('Content-Type', /application\/json/)
      .expect(notFoundResponse);
    expect(paginationService).toHaveBeenCalledTimes(1);
    expect(paginationService).toHaveBeenCalledWith(paginationBodyWidthId);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(paginationPattern, paginationBodyWidthId);
    expect(logError).not.toHaveBeenCalled();
  });

  it(createTestName('pagination category failed with unknown error', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(categoryController as any, 'logError');
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => UnknownError));
    const paginationService = jest.spyOn(categoryService, 'pagination');
    await api
      .post(paginationCategoryUrl)
      .send(paginationBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(UnknownError.message));
    expect(paginationService).toHaveBeenCalledTimes(1);
    expect(paginationService).toHaveBeenCalledWith(paginationBodyWidthId);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(paginationPattern, paginationBodyWidthId);
    expect(logError).not.toHaveBeenCalled();
  });

  it(createTestName('pagination category failed with server error', HttpStatus.INTERNAL_SERVER_ERROR), async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(categoryController as any, 'logError');
    const serverError = new InternalServerErrorException();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => serverError));
    const paginationService = jest.spyOn(categoryService, 'pagination');
    await api
      .post(paginationCategoryUrl)
      .send(paginationBody)
      .expect(HttpStatus.INTERNAL_SERVER_ERROR)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(serverError.message));
    expect(paginationService).toHaveBeenCalledTimes(1);
    expect(paginationService).toHaveBeenCalledWith(paginationBodyWidthId);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(paginationPattern, paginationBodyWidthId);
    expect(logError).not.toHaveBeenCalled();
  });

  it(createTestName('pagination category failed with missing field', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(categoryController as any, 'logError');
    const missingQueryFieldBody = {
      pageSize: paginationBody.pageSize,
      pageNumber: paginationBody.pageNumber,
    };
    const send = jest.spyOn(clientProxy, 'send');
    const paginationService = jest.spyOn(categoryService, 'pagination');
    const response = await api
      .post(paginationCategoryUrl)
      .send(missingQueryFieldBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/);
    expect(response.body).toEqual({ messages: expect.any(Array) });
    expect(paginationService).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
    expect(logError).not.toHaveBeenCalled();
  });

  it(createTestName('pagination category failed with undefined field', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(categoryController as any, 'logError');
    const undefinedFieldRequestBody = {
      pageSize: paginationBody.pageSize,
      pageNumber: paginationBody.pageNumber,
      query: paginationBody.query,
      categoryId: Date.now().toString(),
    };
    const send = jest.spyOn(clientProxy, 'send');
    const paginationService = jest.spyOn(categoryService, 'pagination');
    const response = await api
      .post(paginationCategoryUrl)
      .send(undefinedFieldRequestBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/);
    expect(response.body).toEqual({ messages: expect.any(Array) });
    expect(paginationService).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
    expect(logError).not.toHaveBeenCalled();
  });

  it(createTestName('pagination category failed with database disconnect', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(categoryController as any, 'logError');
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new BadRequestException(PrismaDisconnectError.message)));
    const paginationService = jest.spyOn(categoryService, 'pagination');
    await api
      .post(paginationCategoryUrl)
      .send(paginationBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.COMMON.DATABASE_DISCONNECT));
    expect(paginationService).toHaveBeenCalledTimes(1);
    expect(paginationService).toHaveBeenCalledWith(paginationBodyWidthId);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(paginationPattern, paginationBodyWidthId);
    expect(logError).not.toHaveBeenCalled();
  });

  it(createTestName('pagination category success with empty query', HttpStatus.OK), async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(categoryController as any, 'logError');
    const paginationEmptyQueryRequestBody = {
      ...paginationBody,
      query: {},
    };
    const finalPaginationRequestBody = {
      ...paginationBody,
      query: {
        category_id: true,
        name: true,
        avatar: true,
        _count: {
          select: {
            product: true,
          },
        },
      },
    };
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(responseData));
    const paginationService = jest.spyOn(categoryService, 'pagination');
    await api
      .post(paginationCategoryUrl)
      .send(paginationEmptyQueryRequestBody)
      .expect(HttpStatus.OK)
      .expect('Content-Type', /application\/json/)
      .expect(instanceToPlain(plainToInstance(CategoryPaginationFormatter, responseData)));
    expect(paginationService).toHaveBeenCalledTimes(1);
    expect(paginationService).toHaveBeenCalledWith(finalPaginationRequestBody);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(paginationPattern, finalPaginationRequestBody);
    expect(logError).not.toHaveBeenCalled();
  });
});

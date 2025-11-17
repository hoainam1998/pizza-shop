import { BadRequestException, HttpStatus, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { expect } from '@jest/globals';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { ClientProxy } from '@nestjs/microservices';
import TestAgent from 'supertest/lib/agent';
import startUp from './pre-setup';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import { PrismaDisconnectError } from '@share/test/pre-setup/mock/errors/prisma-errors';
import { getCategoryPattern } from '@share/pattern';
import { category } from '@share/test/pre-setup/mock/data/category';
import { createDescribeTest, createTestName } from '@share/test/helpers';
import CategoryService from '../category.service';
import messages from '@share/constants/messages';
import { HTTP_METHOD } from '@share/enums';
import { CategoryDetailSerializer } from '@share/dto/serializer/category';
import { createMessage, createMessages } from '@share/utils';
import { CategoryRouter } from '@share/router';
delete category._count;
const getCategoryDetailUrl: string = CategoryRouter.absolute.detail;

const getCategoryRequestBody = {
  categoryId: Date.now().toString(),
  query: {
    name: true,
    avatar: true,
  },
};

let api: TestAgent;
let clientProxy: ClientProxy;
let close: () => Promise<void>;
let categoryService: CategoryService;

beforeEach(async () => {
  const requestTest = await startUp();
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

describe(createDescribeTest(HTTP_METHOD.POST, getCategoryDetailUrl), () => {
  it(createTestName('get category detail success', HttpStatus.OK), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(category));
    const getCategoryService = jest.spyOn(categoryService, 'getCategory');
    await api
      .post(getCategoryDetailUrl)
      .send(getCategoryRequestBody)
      .expect(HttpStatus.OK)
      .expect('Content-Type', /application\/json/)
      .expect(instanceToPlain(plainToInstance(CategoryDetailSerializer, category)));
    expect(getCategoryService).toHaveBeenCalledTimes(1);
    expect(getCategoryService).toHaveBeenCalledWith(getCategoryRequestBody);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(getCategoryPattern, getCategoryRequestBody);
  });

  it(createTestName('get category detail failed with output validate', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new BadRequestException(createMessage(messages.COMMON.OUTPUT_VALIDATE))));
    const getCategoryService = jest.spyOn(categoryService, 'getCategory');
    await api
      .post(getCategoryDetailUrl)
      .send(getCategoryRequestBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.COMMON.OUTPUT_VALIDATE));
    expect(getCategoryService).toHaveBeenCalledTimes(1);
    expect(getCategoryService).toHaveBeenCalledWith(getCategoryRequestBody);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(getCategoryPattern, getCategoryRequestBody);
  });

  it(createTestName('get category detail failed with not found error', HttpStatus.NOT_FOUND), async () => {
    expect.hasAssertions();
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new NotFoundException(createMessage(messages.CATEGORY.NOT_FOUND))));
    const getCategoryService = jest.spyOn(categoryService, 'getCategory');
    await api
      .post(getCategoryDetailUrl)
      .send(getCategoryRequestBody)
      .expect(HttpStatus.NOT_FOUND)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.CATEGORY.NOT_FOUND));
    expect(getCategoryService).toHaveBeenCalledTimes(1);
    expect(getCategoryService).toHaveBeenCalledWith(getCategoryRequestBody);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(getCategoryPattern, getCategoryRequestBody);
  });

  it(createTestName('get category detail failed with unknown error', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => UnknownError));
    const getCategoryService = jest.spyOn(categoryService, 'getCategory');
    await api
      .post(getCategoryDetailUrl)
      .send(getCategoryRequestBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(UnknownError.message));
    expect(getCategoryService).toHaveBeenCalledTimes(1);
    expect(getCategoryService).toHaveBeenCalledWith(getCategoryRequestBody);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(getCategoryPattern, getCategoryRequestBody);
  });

  it(createTestName('get category detail failed with server error', HttpStatus.INTERNAL_SERVER_ERROR), async () => {
    expect.hasAssertions();
    const serverError = new InternalServerErrorException();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => serverError));
    const getCategoryService = jest.spyOn(categoryService, 'getCategory');
    await api
      .post(getCategoryDetailUrl)
      .send(getCategoryRequestBody)
      .expect(HttpStatus.INTERNAL_SERVER_ERROR)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(serverError.message));
    expect(getCategoryService).toHaveBeenCalledTimes(1);
    expect(getCategoryService).toHaveBeenCalledWith(getCategoryRequestBody);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(getCategoryPattern, getCategoryRequestBody);
  });

  it(createTestName('get category detail failed with missing field', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const missingQueryFieldBody = {
      categoryId: getCategoryRequestBody.categoryId,
    };
    const send = jest.spyOn(clientProxy, 'send');
    const getCategoryService = jest.spyOn(categoryService, 'getCategory');
    const response = await api
      .post(getCategoryDetailUrl)
      .send(missingQueryFieldBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/);
    expect(response.body).toEqual({ messages: expect.any(Array) });
    expect(getCategoryService).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(createTestName('get category detail failed with undefined field', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const undefinedFieldBody = {
      ...getCategoryRequestBody,
      categoryIds: [Date.now().toString()],
    };
    const send = jest.spyOn(clientProxy, 'send');
    const getCategoryService = jest.spyOn(categoryService, 'getCategory');
    const response = await api
      .post(getCategoryDetailUrl)
      .send(undefinedFieldBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/);
    expect(response.body).toEqual({ messages: expect.any(Array) });
    expect(getCategoryService).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(createTestName('get category detail failed with empty query', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const queryEmptyBody = {
      ...getCategoryRequestBody,
      query: {},
    };
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(category));
    const getCategoryService = jest.spyOn(categoryService, 'getCategory');
    await api
      .post(getCategoryDetailUrl)
      .send(queryEmptyBody)
      .expect(HttpStatus.OK)
      .expect(instanceToPlain(plainToInstance(CategoryDetailSerializer, category)));
    expect(getCategoryService).toHaveBeenCalledTimes(1);
    expect(getCategoryService).toHaveBeenCalledWith(getCategoryRequestBody);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(getCategoryPattern, getCategoryRequestBody);
  });

  it(createTestName('get category detail failed with database disconnect', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new BadRequestException(PrismaDisconnectError.message)));
    const getCategoryService = jest.spyOn(categoryService, 'getCategory');
    await api
      .post(getCategoryDetailUrl)
      .send(getCategoryRequestBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.COMMON.DATABASE_DISCONNECT));
    expect(getCategoryService).toHaveBeenCalledTimes(1);
    expect(getCategoryService).toHaveBeenCalledWith(getCategoryRequestBody);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(getCategoryPattern, getCategoryRequestBody);
  });
});

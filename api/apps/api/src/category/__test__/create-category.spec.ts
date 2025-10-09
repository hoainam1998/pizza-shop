import { of, throwError } from 'rxjs';
import { expect } from '@jest/globals';
import TestAgent from 'supertest/lib/agent';
import { ClientProxy } from '@nestjs/microservices';
import startUp from './pre-setup';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import { createCategoryPattern } from '@share/pattern';
import { category } from '@share/test/pre-setup/mock/data/category';
import { getStaticFile, createDescribeTest, createTestName } from '@share/test/helpers';
import CategoryService from '../category.service';
import { BadRequestException, HttpStatus, InternalServerErrorException } from '@nestjs/common';
import messages from '@share/constants/messages';
import { HTTP_METHOD } from '@share/enums';
import { PrismaDisconnectError } from '@share/test/pre-setup/mock/errors/prisma-errors';
const createCategoryUrl = '/category/create';

const categoryBody = {
  name: category.name,
  avatar: expect.toBeImageBase64(),
  category_id: expect.any(String),
};

describe(createDescribeTest(HTTP_METHOD.POST, createCategoryUrl), () => {
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

  it(createTestName('create category success', HttpStatus.CREATED), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(category));
    const createCategory = jest.spyOn(categoryService, 'createCategory');
    await api
      .post(createCategoryUrl)
      .field('name', category.name)
      .attach('avatar', getStaticFile('test-image.png'))
      .expect(HttpStatus.CREATED)
      .expect('Content-Type', /application\/json/)
      .expect({
        message: messages.CATEGORY.ADD_CATEGORY_SUCCESS,
      });
    expect(createCategory).toHaveBeenCalledTimes(1);
    expect(createCategory).toHaveBeenCalledWith(categoryBody);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(createCategoryPattern, categoryBody);
  });

  it(createTestName('create category failed with undefined field', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(category));
    const createCategory = jest.spyOn(categoryService, 'createCategory');
    const response = await api
      .post(createCategoryUrl)
      .field('categoryIds', Date.now().toString())
      .field('name', category.name)
      .attach('avatar', getStaticFile('test-image.png'))
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/);
    expect(response.body).toEqual(expect.any(Array));
    expect(createCategory).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(createTestName('create category failed with unknown error', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockImplementation(() => {
      return throwError(() => UnknownError);
    });
    const createCategory = jest.spyOn(categoryService, 'createCategory');
    await api
      .post(createCategoryUrl)
      .field('name', category.name)
      .attach('avatar', getStaticFile('test-image.png'))
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect({
        message: UnknownError.message,
      });
    expect(createCategory).toHaveBeenCalledTimes(1);
    expect(createCategory).toHaveBeenCalledWith(categoryBody);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(createCategoryPattern, categoryBody);
  });

  it(createTestName('create category failed with avatar empty', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const errorMessage = messages.COMMON.EMPTY_FILE.replace(/{fieldname}/, 'avatar');
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(category));
    const createCategory = jest.spyOn(categoryService, 'createCategory');
    await api
      .post(createCategoryUrl)
      .field('name', category.name)
      .attach('avatar', getStaticFile('empty.png'))
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect({
        message: errorMessage,
      });
    expect(createCategory).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(createTestName('create category failed with avatar wrong type', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(category));
    const createCategory = jest.spyOn(categoryService, 'createCategory');
    await api
      .post(createCategoryUrl)
      .field('name', category.name)
      .attach('avatar', getStaticFile('favicon.ico'))
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect({
        message: messages.COMMON.FILE_TYPE_INVALID,
      });
    expect(createCategory).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(createTestName('create category failed with missing avatar field', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(category));
    const createCategory = jest.spyOn(categoryService, 'createCategory');
    const response = await api
      .post(createCategoryUrl)
      .field('name', category.name)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/);
    expect(response.body).toEqual({
      message: expect.any(String),
    });
    expect(createCategory).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(createTestName('create category failed with missing name field', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(category));
    const createCategory = jest.spyOn(categoryService, 'createCategory');
    const response = await api
      .post(createCategoryUrl)
      .attach('avatar', getStaticFile('test-image.png'))
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/);
    expect(response.body).toEqual(expect.any(Array));
    expect(createCategory).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(createTestName('create category failed with database disconnect', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new BadRequestException(PrismaDisconnectError.message)));
    const createCategory = jest.spyOn(categoryService, 'createCategory');
    await api
      .post(createCategoryUrl)
      .attach('avatar', getStaticFile('test-image.png'))
      .field('name', category.name)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect({
        message: messages.COMMON.DATABASE_DISCONNECT,
      });
    expect(createCategory).toHaveBeenCalledTimes(1);
    expect(createCategory).toHaveBeenCalledWith(categoryBody);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(createCategoryPattern, categoryBody);
  });

  it(createTestName('create category failed with server error', HttpStatus.INTERNAL_SERVER_ERROR), async () => {
    expect.hasAssertions();
    const serverError = new InternalServerErrorException();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => serverError));
    const createCategory = jest.spyOn(categoryService, 'createCategory');
    await api
      .post(createCategoryUrl)
      .field('name', category.name)
      .attach('avatar', getStaticFile('test-image.png'))
      .expect(HttpStatus.INTERNAL_SERVER_ERROR)
      .expect('Content-Type', /application\/json/)
      .expect({
        message: serverError.message,
      });
    expect(createCategory).toHaveBeenCalledTimes(1);
    expect(createCategory).toHaveBeenCalledWith(categoryBody);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(createCategoryPattern, categoryBody);
  });
});

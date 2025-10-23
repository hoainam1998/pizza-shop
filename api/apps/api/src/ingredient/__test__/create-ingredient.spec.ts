import TestAgent from 'supertest/lib/agent';
import { of, throwError } from 'rxjs';
import { BadRequestException, HttpStatus, InternalServerErrorException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { createDescribeTest, createTestName, getStaticFile } from '@share/test/helpers';
import { HTTP_METHOD } from '@share/enums';
import IngredientService from '../ingredient.service';
import { createIngredientPattern } from '@share/pattern';
import startUp from './pre-setup';
import { ingredient } from '@share/test/pre-setup/mock/data/ingredient';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import { PrismaDisconnectError } from '@share/test/pre-setup/mock/errors/prisma-errors';
import messages from '@share/constants/messages';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { IngredientCreate } from '@share/dto/validators/ingredient.dto';

const createIngredientUrl = '/ingredient/create';
let api: TestAgent;
let clientProxy: ClientProxy;
let close: () => Promise<void>;
let ingredientService: IngredientService;

const ingredientRequestBody = {
  name: ingredient.name,
  unit: ingredient.unit,
  count: ingredient.count,
  price: ingredient.price,
  expiredTime: ingredient.expired_time,
};

const ingredientBody = instanceToPlain(plainToInstance(IngredientCreate, ingredientRequestBody));

beforeEach(async () => {
  const requestTest = await startUp();
  api = requestTest.api;
  clientProxy = requestTest.clientProxy;
  close = () => requestTest.app.close();
  ingredientService = requestTest.app.get(IngredientService);
});

afterEach(async () => {
  if (close) {
    await close();
  }
});

describe(createDescribeTest(HTTP_METHOD.POST, createIngredientUrl), () => {
  it(createTestName('create ingredient success', HttpStatus.OK), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(ingredient));
    const createIngredient = jest.spyOn(ingredientService, 'createIngredient');
    ingredientBody.avatar = expect.any(String);

    await api
      .post(createIngredientUrl)
      .field('name', ingredient.name)
      .field('unit', ingredient.unit)
      .field('count', ingredient.count)
      .field('price', ingredient.price)
      .field('expiredTime', ingredient.expired_time)
      .attach('avatar', getStaticFile('test-image.png'))
      .expect(HttpStatus.CREATED)
      .expect('Content-Type', /application\/json/)
      .expect({
        message: messages.INGREDIENT.CREATE_INGREDIENT_SUCCESS,
      });
    expect(createIngredient).toHaveBeenCalledTimes(1);
    expect(createIngredient).toHaveBeenCalledWith(ingredientBody);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(createIngredientPattern, ingredientBody);
  });

  it(createTestName('create ingredient failed with undefined field', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(ingredient));
    const createIngredient = jest.spyOn(ingredientService, 'createIngredient');
    const response = await api
      .post(createIngredientUrl)
      .field('ingredientId', Date.now().toString())
      .field('name', ingredient.name)
      .field('unit', ingredient.unit)
      .field('count', ingredient.count)
      .field('price', ingredient.price)
      .field('expiredTime', ingredient.expired_time)
      .attach('avatar', getStaticFile('test-image.png'))
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/);
    expect(response.body).toEqual(expect.any(Array));
    expect(createIngredient).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(createTestName('create ingredient failed with avatar empty', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const errorMessage = messages.COMMON.EMPTY_FILE.replace(/{fieldname}/, 'avatar');
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(ingredient));
    const createIngredient = jest.spyOn(ingredientService, 'createIngredient');
    await api
      .post(createIngredientUrl)
      .field('name', ingredient.name)
      .field('unit', ingredient.unit)
      .field('count', ingredient.count)
      .field('price', ingredient.price)
      .field('expiredTime', ingredient.expired_time)
      .attach('avatar', getStaticFile('empty.png'))
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect({
        message: errorMessage,
      });
    expect(createIngredient).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(createTestName('create ingredient failed with avatar wrong type', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(ingredient));
    const createIngredient = jest.spyOn(ingredientService, 'createIngredient');
    await api
      .post(createIngredientUrl)
      .field('name', ingredient.name)
      .field('unit', ingredient.unit)
      .field('count', ingredient.count)
      .field('price', ingredient.price)
      .field('expiredTime', ingredient.expired_time)
      .attach('avatar', getStaticFile('favicon.ico'))
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect({
        message: messages.COMMON.FILE_TYPE_INVALID,
      });
    expect(createIngredient).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(createTestName('create ingredient failed with missing avatar field', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(ingredient));
    const createIngredient = jest.spyOn(ingredientService, 'createIngredient');
    const response = await api
      .post(createIngredientUrl)
      .field('name', ingredient.name)
      .field('unit', ingredient.unit)
      .field('count', ingredient.count)
      .field('price', ingredient.price)
      .field('expiredTime', ingredient.expired_time)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/);
    expect(response.body).toEqual({
      message: expect.any(String),
    });
    expect(createIngredient).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(createTestName('create ingredient failed with missing name field', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(ingredient));
    const createIngredient = jest.spyOn(ingredientService, 'createIngredient');
    const response = await api
      .post(createIngredientUrl)
      .field('unit', ingredient.unit)
      .field('count', ingredient.count)
      .field('price', ingredient.price)
      .field('expiredTime', ingredient.expired_time)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/);
    expect(response.body).toEqual(expect.any(Array));
    expect(createIngredient).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(createTestName('create ingredient failed with zero count field', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(ingredient));
    const createIngredient = jest.spyOn(ingredientService, 'createIngredient');
    const response = await api
      .post(createIngredientUrl)
      .field('name', ingredient.name)
      .field('unit', ingredient.unit)
      .field('count', 0)
      .field('price', ingredient.price)
      .field('expiredTime', ingredient.expired_time)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/);
    expect(response.body).toEqual(['count must be a positive number']);
    expect(createIngredient).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(createTestName('create ingredient failed with zero price field', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(ingredient));
    const createIngredient = jest.spyOn(ingredientService, 'createIngredient');
    const response = await api
      .post(createIngredientUrl)
      .field('name', ingredient.name)
      .field('unit', ingredient.unit)
      .field('count', ingredient.count)
      .field('price', 0)
      .field('expiredTime', ingredient.expired_time)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/);
    expect(response.body).toEqual(['price must be a positive number']);
    expect(createIngredient).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(createTestName('create ingredient failed with unknown error', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => UnknownError));
    const createIngredient = jest.spyOn(ingredientService, 'createIngredient');
    await api
      .post(createIngredientUrl)
      .field('name', ingredient.name)
      .field('unit', ingredient.unit)
      .field('count', ingredient.count)
      .field('price', ingredient.price)
      .field('expiredTime', ingredient.expired_time)
      .attach('avatar', getStaticFile('test-image.png'))
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect({
        message: UnknownError.message,
      });
    expect(createIngredient).toHaveBeenCalledTimes(1);
    expect(createIngredient).toHaveBeenCalledWith(ingredientBody);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(createIngredientPattern, ingredientBody);
  });

  it(createTestName('create ingredient failed with database disconnect error', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new BadRequestException(PrismaDisconnectError.message)));
    const createIngredient = jest.spyOn(ingredientService, 'createIngredient');
    await api
      .post(createIngredientUrl)
      .field('name', ingredient.name)
      .field('unit', ingredient.unit)
      .field('count', ingredient.count)
      .field('price', ingredient.price)
      .field('expiredTime', ingredient.expired_time)
      .attach('avatar', getStaticFile('test-image.png'))
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect({
        message: messages.COMMON.DATABASE_DISCONNECT,
      });
    expect(createIngredient).toHaveBeenCalledTimes(1);
    expect(createIngredient).toHaveBeenCalledWith(ingredientBody);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(createIngredientPattern, ingredientBody);
  });

  it(createTestName('create ingredient failed with server error', HttpStatus.INTERNAL_SERVER_ERROR), async () => {
    expect.hasAssertions();
    const serverError = new InternalServerErrorException();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => serverError));
    const createIngredient = jest.spyOn(ingredientService, 'createIngredient');
    await api
      .post(createIngredientUrl)
      .field('name', ingredient.name)
      .field('unit', ingredient.unit)
      .field('count', ingredient.count)
      .field('price', ingredient.price)
      .field('expiredTime', ingredient.expired_time)
      .attach('avatar', getStaticFile('test-image.png'))
      .expect(HttpStatus.INTERNAL_SERVER_ERROR)
      .expect('Content-Type', /application\/json/)
      .expect({
        message: serverError.message,
      });
    expect(createIngredient).toHaveBeenCalledTimes(1);
    expect(createIngredient).toHaveBeenCalledWith(ingredientBody);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(createIngredientPattern, ingredientBody);
  });
});

import TestAgent from 'supertest/lib/agent';
import { expect } from '@jest/globals';
import { of, throwError } from 'rxjs';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { BadRequestException, HttpStatus, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { createDescribeTest, createTestName, getStaticFile } from '@share/test/helpers';
import { HTTP_METHOD } from '@share/enums';
import IngredientService from '../ingredient.service';
import { updateIngredientPattern } from '@share/pattern';
import startUp from './pre-setup';
import { ingredient } from '@share/test/pre-setup/mock/data/ingredient';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import { PrismaDisconnectError } from '@share/test/pre-setup/mock/errors/prisma-errors';
import messages from '@share/constants/messages';
import { IngredientUpdate } from '@share/dto/validators/ingredient.dto';
import { createMessage, createMessages } from '@share/utils';

const updateIngredientUrl = '/ingredient/update';
let api: TestAgent;
let clientProxy: ClientProxy;
let close: () => Promise<void>;
let ingredientService: IngredientService;

const ingredientRequestBody = {
  ingredientId: ingredient.ingredient_id,
  name: ingredient.name,
  unit: ingredient.unit,
  count: ingredient.count,
  price: ingredient.price,
  expiredTime: ingredient.expired_time,
};

const ingredientBody = instanceToPlain(plainToInstance(IngredientUpdate, ingredientRequestBody), {
  groups: ['update'],
});

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

describe(createDescribeTest(HTTP_METHOD.PUT, updateIngredientUrl), () => {
  it(createTestName('update ingredient success', HttpStatus.OK), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(ingredient));
    const updateIngredient = jest.spyOn(ingredientService, 'updateIngredient');
    ingredientBody.avatar = expect.toBeImageBase64();

    await api
      .put(updateIngredientUrl)
      .field('ingredientId', ingredient.ingredient_id)
      .field('name', ingredient.name)
      .field('unit', ingredient.unit)
      .field('count', ingredient.count)
      .field('price', ingredient.price)
      .field('expiredTime', ingredient.expired_time)
      .attach('avatar', getStaticFile('test-image.png'))
      .expect(HttpStatus.CREATED)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.INGREDIENT.UPDATE_INGREDIENT_SUCCESS));
    expect(updateIngredient).toHaveBeenCalledTimes(1);
    expect(updateIngredient).toHaveBeenCalledWith(ingredientBody);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(updateIngredientPattern, ingredientBody);
  });

  it(createTestName('update ingredient failed with undefined field', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(ingredient));
    const updateIngredient = jest.spyOn(ingredientService, 'updateIngredient');
    const response = await api
      .put(updateIngredientUrl)
      .field('ingredientIds', [ingredient.ingredient_id])
      .field('ingredientId', ingredient.ingredient_id)
      .field('name', ingredient.name)
      .field('unit', ingredient.unit)
      .field('count', ingredient.count)
      .field('price', ingredient.price)
      .field('expiredTime', ingredient.expired_time)
      .attach('avatar', getStaticFile('test-image.png'))
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/);
    expect(response.body).toEqual({ messages: expect.any(Array) });
    expect(updateIngredient).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(createTestName('update ingredient failed with avatar empty', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const errorMessage = messages.COMMON.EMPTY_FILE.replace(/{fieldname}/, 'avatar');
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(ingredient));
    const updateIngredient = jest.spyOn(ingredientService, 'updateIngredient');
    await api
      .put(updateIngredientUrl)
      .field('ingredientId', ingredient.ingredient_id)
      .field('name', ingredient.name)
      .field('unit', ingredient.unit)
      .field('count', ingredient.count)
      .field('price', ingredient.price)
      .field('expiredTime', ingredient.expired_time)
      .attach('avatar', getStaticFile('empty.png'))
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(errorMessage));
    expect(updateIngredient).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(createTestName('update ingredient failed with avatar wrong type', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(ingredient));
    const updateIngredient = jest.spyOn(ingredientService, 'updateIngredient');
    await api
      .put(updateIngredientUrl)
      .field('ingredientId', ingredient.ingredient_id)
      .field('name', ingredient.name)
      .field('unit', ingredient.unit)
      .field('count', ingredient.count)
      .field('price', ingredient.price)
      .field('expiredTime', ingredient.expired_time)
      .attach('avatar', getStaticFile('favicon.ico'))
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.COMMON.FILE_TYPE_INVALID));
    expect(updateIngredient).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(createTestName('update ingredient failed with missing avatar field', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(ingredient));
    const updateIngredient = jest.spyOn(ingredientService, 'updateIngredient');
    const response = await api
      .put(updateIngredientUrl)
      .field('ingredientId', ingredient.ingredient_id)
      .field('name', ingredient.name)
      .field('unit', ingredient.unit)
      .field('count', ingredient.count)
      .field('price', ingredient.price)
      .field('expiredTime', ingredient.expired_time)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/);
    expect(response.body).toEqual(createMessages(expect.any(String)));
    expect(updateIngredient).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(createTestName('update ingredient failed with missing name field', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(ingredient));
    const updateIngredient = jest.spyOn(ingredientService, 'updateIngredient');
    const response = await api
      .put(updateIngredientUrl)
      .field('ingredientId', ingredient.ingredient_id)
      .field('unit', ingredient.unit)
      .field('count', ingredient.count)
      .field('price', ingredient.price)
      .field('expiredTime', ingredient.expired_time)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/);
    expect(response.body).toEqual({ messages: expect.any(Array) });
    expect(updateIngredient).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(createTestName('update ingredient failed with zero count field', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(ingredient));
    const updateIngredient = jest.spyOn(ingredientService, 'updateIngredient');
    const response = await api
      .put(updateIngredientUrl)
      .field('ingredientId', ingredient.ingredient_id)
      .field('name', ingredient.name)
      .field('unit', ingredient.unit)
      .field('count', 0)
      .field('price', ingredient.price)
      .field('expiredTime', ingredient.expired_time)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/);
    expect(response.body).toEqual(createMessages('count must be a positive number'));
    expect(updateIngredient).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(createTestName('update ingredient failed with zero price field', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(ingredient));
    const updateIngredient = jest.spyOn(ingredientService, 'updateIngredient');
    const response = await api
      .put(updateIngredientUrl)
      .field('ingredientId', ingredient.ingredient_id)
      .field('name', ingredient.name)
      .field('unit', ingredient.unit)
      .field('count', ingredient.count)
      .field('price', 0)
      .field('expiredTime', ingredient.expired_time)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/);
    expect(response.body).toEqual(createMessages('price must be a positive number'));
    expect(updateIngredient).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(createTestName('update ingredient failed with not found error', HttpStatus.NOT_FOUND), async () => {
    expect.hasAssertions();
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new NotFoundException(messages.INGREDIENT.NOT_FOUND)));
    const updateIngredient = jest.spyOn(ingredientService, 'updateIngredient');
    await api
      .put(updateIngredientUrl)
      .field('ingredientId', ingredient.ingredient_id)
      .field('name', ingredient.name)
      .field('unit', ingredient.unit)
      .field('count', ingredient.count)
      .field('price', ingredient.price)
      .field('expiredTime', ingredient.expired_time)
      .attach('avatar', getStaticFile('test-image.png'))
      .expect(HttpStatus.NOT_FOUND)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.INGREDIENT.NOT_FOUND));
    expect(updateIngredient).toHaveBeenCalledTimes(1);
    expect(updateIngredient).toHaveBeenCalledWith(ingredientBody);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(updateIngredientPattern, ingredientBody);
  });

  it(createTestName('update ingredient failed with unknown error', HttpStatus.INTERNAL_SERVER_ERROR), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => UnknownError));
    const updateIngredient = jest.spyOn(ingredientService, 'updateIngredient');
    await api
      .put(updateIngredientUrl)
      .field('ingredientId', ingredient.ingredient_id)
      .field('name', ingredient.name)
      .field('unit', ingredient.unit)
      .field('count', ingredient.count)
      .field('price', ingredient.price)
      .field('expiredTime', ingredient.expired_time)
      .attach('avatar', getStaticFile('test-image.png'))
      .expect(HttpStatus.INTERNAL_SERVER_ERROR)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(new InternalServerErrorException().message));
    expect(updateIngredient).toHaveBeenCalledTimes(1);
    expect(updateIngredient).toHaveBeenCalledWith(ingredientBody);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(updateIngredientPattern, ingredientBody);
  });

  it(createTestName('update ingredient failed with rpc unknown error', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new BadRequestException(createMessage(messages.COMMON.COMMON_ERROR))));
    const updateIngredient = jest.spyOn(ingredientService, 'updateIngredient');
    await api
      .put(updateIngredientUrl)
      .field('ingredientId', ingredient.ingredient_id)
      .field('name', ingredient.name)
      .field('unit', ingredient.unit)
      .field('count', ingredient.count)
      .field('price', ingredient.price)
      .field('expiredTime', ingredient.expired_time)
      .attach('avatar', getStaticFile('test-image.png'))
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.COMMON.COMMON_ERROR));
    expect(updateIngredient).toHaveBeenCalledTimes(1);
    expect(updateIngredient).toHaveBeenCalledWith(ingredientBody);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(updateIngredientPattern, ingredientBody);
  });

  it(createTestName('update ingredient failed with database disconnect error', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new BadRequestException(PrismaDisconnectError.message)));
    const updateIngredient = jest.spyOn(ingredientService, 'updateIngredient');
    await api
      .put(updateIngredientUrl)
      .field('ingredientId', ingredient.ingredient_id)
      .field('name', ingredient.name)
      .field('unit', ingredient.unit)
      .field('count', ingredient.count)
      .field('price', ingredient.price)
      .field('expiredTime', ingredient.expired_time)
      .attach('avatar', getStaticFile('test-image.png'))
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.COMMON.DATABASE_DISCONNECT));
    expect(updateIngredient).toHaveBeenCalledTimes(1);
    expect(updateIngredient).toHaveBeenCalledWith(ingredientBody);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(updateIngredientPattern, ingredientBody);
  });

  it(createTestName('update ingredient failed with server error', HttpStatus.INTERNAL_SERVER_ERROR), async () => {
    expect.hasAssertions();
    const serverError = new InternalServerErrorException();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => serverError));
    const updateIngredient = jest.spyOn(ingredientService, 'updateIngredient');
    await api
      .put(updateIngredientUrl)
      .field('ingredientId', ingredient.ingredient_id)
      .field('name', ingredient.name)
      .field('unit', ingredient.unit)
      .field('count', ingredient.count)
      .field('price', ingredient.price)
      .field('expiredTime', ingredient.expired_time)
      .attach('avatar', getStaticFile('test-image.png'))
      .expect(HttpStatus.INTERNAL_SERVER_ERROR)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(serverError.message));
    expect(updateIngredient).toHaveBeenCalledTimes(1);
    expect(updateIngredient).toHaveBeenCalledWith(ingredientBody);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(updateIngredientPattern, ingredientBody);
  });
});

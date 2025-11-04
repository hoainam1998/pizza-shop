import { BadRequestException, HttpStatus, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { expect } from '@jest/globals';
import { ClientProxy } from '@nestjs/microservices';
import TestAgent from 'supertest/lib/agent';
import startUp from './pre-setup';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import { PrismaDisconnectError } from '@share/test/pre-setup/mock/errors/prisma-errors';
import { getAllIngredientsPattern } from '@share/pattern';
import { createIngredients } from '@share/test/pre-setup/mock/data/ingredient';
import { createDescribeTest, createTestName } from '@share/test/helpers';
import IngredientService from '../ingredient.service';
import messages from '@share/constants/messages';
import { HTTP_METHOD } from '@share/enums';
import { createMessages } from '@share/utils';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { IngredientSelect } from '@share/dto/validators/ingredient.dto';
import { Ingredient, IngredientList } from '@share/dto/serializer/ingredient';
import { ValidationError } from 'class-validator';
import IngredientController from '../ingredient.controller';
const getAllIngredientsUrl: string = '/ingredient/all';

const getAllIngredientsRequestBody = {
  name: true,
  avatar: true,
  unit: true,
  units: true,
  count: true,
  expiredTime: true,
  status: true,
  price: true,
  disabled: true,
};

const getIngredientsResponse = (groups: string[]): Record<string, any> => {
  return instanceToPlain(plainToInstance(Ingredient, ingredientList.List, { groups: ['unit'] }), {
    groups,
    exposeUnsetFields: false,
  });
};

const ingredients = createIngredients(2);
const ingredientList = new IngredientList(ingredients);
const plainSelect = instanceToPlain(plainToInstance(IngredientSelect, getAllIngredientsRequestBody));
let api: TestAgent;
let clientProxy: ClientProxy;
let close: () => Promise<void>;
let ingredientService: IngredientService;
let ingredientController: IngredientController;

beforeEach(async () => {
  const requestTest = await startUp();
  api = requestTest.api;
  clientProxy = requestTest.clientProxy;
  close = () => requestTest.app.close();
  ingredientService = requestTest.app.get(IngredientService);
  ingredientController = requestTest.app.get(IngredientController);
});

afterEach(async () => {
  if (close) {
    await close();
  }
});

describe(createDescribeTest(HTTP_METHOD.POST, getAllIngredientsUrl), () => {
  it(createTestName('get all ingredients success with attach unit field', HttpStatus.OK), async () => {
    expect.hasAssertions();
    const select = {
      unit: true,
    };
    const ingredientListResponse = getIngredientsResponse(['unit']);
    const plainSelect = instanceToPlain(plainToInstance(IngredientSelect, select));
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(ingredients));
    const getAllIngredients = jest.spyOn(ingredientService, 'getAllIngredients');
    await api
      .post(getAllIngredientsUrl)
      .send(select)
      .expect(HttpStatus.OK)
      .expect('Content-Type', /application\/json/)
      .expect(ingredientListResponse);
    expect(getAllIngredients).toHaveBeenCalledTimes(1);
    expect(getAllIngredients).toHaveBeenCalledWith(plainSelect);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(getAllIngredientsPattern, plainSelect);
  });

  it(createTestName('get all ingredients success with attach units field', HttpStatus.OK), async () => {
    expect.hasAssertions();
    const select = {
      units: true,
    };
    const ingredientListResponse = getIngredientsResponse(['units']);
    const plainSelect = instanceToPlain(plainToInstance(IngredientSelect, select));
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(ingredients));
    const getAllIngredients = jest.spyOn(ingredientService, 'getAllIngredients');
    await api
      .post(getAllIngredientsUrl)
      .send(select)
      .expect(HttpStatus.OK)
      .expect('Content-Type', /application\/json/)
      .expect(ingredientListResponse);
    expect(getAllIngredients).toHaveBeenCalledTimes(1);
    expect(getAllIngredients).toHaveBeenCalledWith(plainSelect);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(getAllIngredientsPattern, plainSelect);
  });

  it(createTestName('get all ingredients success', HttpStatus.OK), async () => {
    expect.hasAssertions();
    const ingredientListResponse = getIngredientsResponse(['unit', 'units']);
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(ingredients));
    const getAllIngredients = jest.spyOn(ingredientService, 'getAllIngredients');
    await api
      .post(getAllIngredientsUrl)
      .send(getAllIngredientsRequestBody)
      .expect(HttpStatus.OK)
      .expect('Content-Type', /application\/json/)
      .expect(ingredientListResponse);
    expect(getAllIngredients).toHaveBeenCalledTimes(1);
    expect(getAllIngredients).toHaveBeenCalledWith(plainSelect);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(getAllIngredientsPattern, plainSelect);
  });

  it(createTestName('get all ingredients failed with output validate', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const validatorErrors = [new ValidationError()];
    const logError = jest.spyOn(ingredientController as any, 'logError').mockImplementation(() => jest.fn());
    jest.spyOn(IngredientList.prototype, 'validate').mockResolvedValue(validatorErrors);
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(ingredients));
    const getAllIngredients = jest.spyOn(ingredientService, 'getAllIngredients');
    await api
      .post(getAllIngredientsUrl)
      .send(getAllIngredientsRequestBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.COMMON.OUTPUT_VALIDATE));
    expect(getAllIngredients).toHaveBeenCalledTimes(1);
    expect(getAllIngredients).toHaveBeenCalledWith(plainSelect);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(getAllIngredientsPattern, plainSelect);
    expect(logError).toHaveBeenCalledTimes(1);
    expect(logError).toHaveBeenCalledWith(validatorErrors, expect.any(String));
  });

  it(createTestName('get all ingredients failed with not found error', HttpStatus.NOT_FOUND), async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(ingredientController as any, 'logError').mockImplementation(() => jest.fn());
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => new NotFoundException([])));
    const getAllIngredients = jest.spyOn(ingredientService, 'getAllIngredients');
    await api
      .post(getAllIngredientsUrl)
      .send(getAllIngredientsRequestBody)
      .expect(HttpStatus.NOT_FOUND)
      .expect('Content-Type', /application\/json/)
      .expect([]);
    expect(getAllIngredients).toHaveBeenCalledTimes(1);
    expect(getAllIngredients).toHaveBeenCalledWith(plainSelect);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(getAllIngredientsPattern, plainSelect);
    expect(logError).not.toHaveBeenCalled();
  });

  it(createTestName('get all ingredients failed with unknown error', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(ingredientController as any, 'logError').mockImplementation(() => jest.fn());
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => UnknownError));
    const getAllIngredients = jest.spyOn(ingredientService, 'getAllIngredients');
    await api
      .post(getAllIngredientsUrl)
      .send(getAllIngredientsRequestBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(UnknownError.message));
    expect(getAllIngredients).toHaveBeenCalledTimes(1);
    expect(getAllIngredients).toHaveBeenCalledWith(plainSelect);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(getAllIngredientsPattern, plainSelect);
    expect(logError).not.toHaveBeenCalled();
  });

  it(createTestName('get all ingredients failed with server error', HttpStatus.INTERNAL_SERVER_ERROR), async () => {
    expect.hasAssertions();
    const serverError = new InternalServerErrorException();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => serverError));
    const getAllIngredients = jest.spyOn(ingredientService, 'getAllIngredients');
    await api
      .post(getAllIngredientsUrl)
      .send(getAllIngredientsRequestBody)
      .expect(HttpStatus.INTERNAL_SERVER_ERROR)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(serverError.message));
    expect(getAllIngredients).toHaveBeenCalledTimes(1);
    expect(getAllIngredients).toHaveBeenCalledWith(plainSelect);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(getAllIngredientsPattern, plainSelect);
  });

  it(createTestName('get all ingredients success with empty request body', HttpStatus.OK), async () => {
    expect.hasAssertions();
    const ingredientListResponse = getIngredientsResponse(['unit', 'units']);
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(ingredients));
    const getAllIngredients = jest.spyOn(ingredientService, 'getAllIngredients');
    await api.post(getAllIngredientsUrl).send({}).expect(HttpStatus.OK).expect(ingredientListResponse);
    expect(getAllIngredients).toHaveBeenCalledTimes(1);
    expect(getAllIngredients).toHaveBeenCalledWith(plainSelect);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(getAllIngredientsPattern, plainSelect);
  });

  it(createTestName('get all ingredients failed with undefined field', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const undefinedFieldRequestBody = {
      ...getAllIngredientsRequestBody,
      categoryId: Date.now().toString(),
    };
    const send = jest.spyOn(clientProxy, 'send');
    const getAllIngredients = jest.spyOn(ingredientService, 'getAllIngredients');
    const response = await api
      .post(getAllIngredientsUrl)
      .send(undefinedFieldRequestBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/);
    expect(response.body).toEqual({ messages: expect.any(Array) });
    expect(getAllIngredients).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(createTestName('get all ingredients failed with database disconnect', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new BadRequestException(PrismaDisconnectError.message)));
    const getAllIngredients = jest.spyOn(ingredientService, 'getAllIngredients');
    await api
      .post(getAllIngredientsUrl)
      .send(getAllIngredientsRequestBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.COMMON.DATABASE_DISCONNECT));
    expect(getAllIngredients).toHaveBeenCalledTimes(1);
    expect(getAllIngredients).toHaveBeenCalledWith(plainSelect);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(getAllIngredientsPattern, plainSelect);
  });
});

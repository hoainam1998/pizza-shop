import { BadRequestException, HttpStatus, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { ValidationError } from 'class-validator';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { expect } from '@jest/globals';
import { ClientProxy } from '@nestjs/microservices';
import TestAgent from 'supertest/lib/agent';
import startUp from './pre-setup';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import { PrismaDisconnectError } from '@share/test/pre-setup/mock/errors/prisma-errors';
import { getIngredientDetailPattern } from '@share/pattern';
import { ingredient } from '@share/test/pre-setup/mock/data/ingredient';
import { createDescribeTest, createTestName } from '@share/test/helpers';
import IngredientService from '../ingredient.service';
import IngredientController from '../ingredient.controller';
import messages from '@share/constants/messages';
import { HTTP_METHOD } from '@share/enums';
import { createMessages } from '@share/utils';
import { IngredientSelect } from '@share/dto/validators/ingredient.dto';
import { Ingredient } from '@share/dto/serializer/ingredient';
import { IngredientRouter } from '@share/router';
const getIngredientUrl: string = IngredientRouter.absolute.detail;

const getIngredientRequestBody: any = {
  query: {
    name: true,
    avatar: true,
    unit: true,
    units: true,
    count: true,
    expiredTime: true,
    status: true,
    price: true,
    disabled: true,
  },
  ingredientId: ingredient.ingredient_id,
};

const getIngredientResponse = (groups: string[]): Record<string, any> => {
  return instanceToPlain(plainToInstance(Ingredient, ingredient, { groups: ['unit'] }), {
    groups,
    exposeUnsetFields: false,
  });
};

const query = instanceToPlain(
  plainToInstance(IngredientSelect, IngredientSelect.plain(getIngredientRequestBody.query)),
);
const select = { ...getIngredientRequestBody, query };
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

describe(createDescribeTest(HTTP_METHOD.POST, getIngredientUrl), () => {
  it(createTestName('get ingredient success without unit and units field', HttpStatus.OK), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(ingredient));
    const ingredientResponse = getIngredientResponse([]);
    const getIngredient = jest.spyOn(ingredientService, 'getIngredient');
    const requestBody: any = {
      query: {
        name: true,
        avatar: true,
        count: true,
        expiredTime: true,
        status: true,
        price: true,
        disabled: true,
      },
      ingredientId: getIngredientRequestBody.ingredientId,
    };
    const query = instanceToPlain(plainToInstance(IngredientSelect, IngredientSelect.plain(requestBody.query)));
    const select = { ...requestBody, query };
    await api
      .post(getIngredientUrl)
      .send(requestBody)
      .expect(HttpStatus.OK)
      .expect('Content-Type', /application\/json/)
      .expect(ingredientResponse);
    expect(getIngredient).toHaveBeenCalledTimes(1);
    expect(getIngredient).toHaveBeenCalledWith(select);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(getIngredientDetailPattern, select);
  });

  it(createTestName('get ingredient success with attach unit field', HttpStatus.OK), async () => {
    expect.hasAssertions();
    const requestBody: any = {
      query: {
        name: true,
        avatar: true,
        count: true,
        unit: true,
        expiredTime: true,
        status: true,
        price: true,
        disabled: true,
      },
      ingredientId: getIngredientRequestBody.ingredientId,
    };
    const query = instanceToPlain(plainToInstance(IngredientSelect, IngredientSelect.plain(requestBody.query)));
    const select = { ...requestBody, query };
    const ingredientResponse = getIngredientResponse(['unit']);
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(ingredient));
    const getIngredient = jest.spyOn(ingredientService, 'getIngredient');
    await api
      .post(getIngredientUrl)
      .send(requestBody)
      .expect(HttpStatus.OK)
      .expect('Content-Type', /application\/json/)
      .expect(ingredientResponse);
    expect(getIngredient).toHaveBeenCalledTimes(1);
    expect(getIngredient).toHaveBeenCalledWith(select);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(getIngredientDetailPattern, select);
  });

  it(createTestName('get ingredient success with attach units field', HttpStatus.OK), async () => {
    expect.hasAssertions();
    const requestBody: any = {
      query: {
        name: true,
        avatar: true,
        count: true,
        units: true,
        expiredTime: true,
        status: true,
        price: true,
        disabled: true,
      },
      ingredientId: getIngredientRequestBody.ingredientId,
    };
    const query = instanceToPlain(plainToInstance(IngredientSelect, IngredientSelect.plain(requestBody.query)));
    const select = { ...requestBody, query };
    const ingredientResponse = getIngredientResponse(['units']);
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(ingredient));
    const getIngredient = jest.spyOn(ingredientService, 'getIngredient');
    await api
      .post(getIngredientUrl)
      .send(requestBody)
      .expect(HttpStatus.OK)
      .expect('Content-Type', /application\/json/)
      .expect(ingredientResponse);
    expect(getIngredient).toHaveBeenCalledTimes(1);
    expect(getIngredient).toHaveBeenCalledWith(select);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(getIngredientDetailPattern, select);
  });

  it(createTestName('get ingredient success', HttpStatus.OK), async () => {
    expect.hasAssertions();
    const ingredientResponse = getIngredientResponse(['unit', 'units']);
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(ingredient));
    const getIngredient = jest.spyOn(ingredientService, 'getIngredient');
    await api
      .post(getIngredientUrl)
      .send(getIngredientRequestBody)
      .expect(HttpStatus.OK)
      .expect('Content-Type', /application\/json/)
      .expect(ingredientResponse);
    expect(getIngredient).toHaveBeenCalledTimes(1);
    expect(getIngredient).toHaveBeenCalledWith(select);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(getIngredientDetailPattern, select);
  });

  it(createTestName('get ingredient failed with output validate', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const validatorErrors = [new ValidationError()];
    const logError = jest.spyOn(ingredientController as any, 'logError').mockImplementation(() => jest.fn());
    jest.spyOn(Ingredient.prototype, 'validate').mockResolvedValue(validatorErrors);
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(ingredient));
    const getIngredient = jest.spyOn(ingredientService, 'getIngredient');
    await api
      .post(getIngredientUrl)
      .send(getIngredientRequestBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.COMMON.OUTPUT_VALIDATE));
    expect(getIngredient).toHaveBeenCalledTimes(1);
    expect(getIngredient).toHaveBeenCalledWith(select);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(getIngredientDetailPattern, select);
    expect(logError).toHaveBeenCalledTimes(1);
    expect(logError).toHaveBeenCalledWith(validatorErrors, expect.any(String));
  });

  it(createTestName('get ingredient failed with not found error', HttpStatus.NOT_FOUND), async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(ingredientController as any, 'logError').mockImplementation(() => jest.fn());
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => new NotFoundException([])));
    const getIngredient = jest.spyOn(ingredientService, 'getIngredient');
    await api
      .post(getIngredientUrl)
      .send(getIngredientRequestBody)
      .expect(HttpStatus.NOT_FOUND)
      .expect('Content-Type', /application\/json/)
      .expect([]);
    expect(getIngredient).toHaveBeenCalledTimes(1);
    expect(getIngredient).toHaveBeenCalledWith(select);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(getIngredientDetailPattern, select);
    expect(logError).not.toHaveBeenCalled();
  });

  it(createTestName('get ingredient failed with unknown error', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(ingredientController as any, 'logError').mockImplementation(() => jest.fn());
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => UnknownError));
    const getIngredient = jest.spyOn(ingredientService, 'getIngredient');
    await api
      .post(getIngredientUrl)
      .send(getIngredientRequestBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(UnknownError.message));
    expect(getIngredient).toHaveBeenCalledTimes(1);
    expect(getIngredient).toHaveBeenCalledWith(select);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(getIngredientDetailPattern, select);
    expect(logError).not.toHaveBeenCalled();
  });

  it(createTestName('get ingredient failed with server error', HttpStatus.INTERNAL_SERVER_ERROR), async () => {
    expect.hasAssertions();
    const serverError = new InternalServerErrorException();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => serverError));
    const getIngredient = jest.spyOn(ingredientService, 'getIngredient');
    await api
      .post(getIngredientUrl)
      .send(getIngredientRequestBody)
      .expect(HttpStatus.INTERNAL_SERVER_ERROR)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(serverError.message));
    expect(getIngredient).toHaveBeenCalledTimes(1);
    expect(getIngredient).toHaveBeenCalledWith(select);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(getIngredientDetailPattern, select);
  });

  it(createTestName('get ingredient success with empty request body', HttpStatus.OK), async () => {
    expect.hasAssertions();
    const ingredientResponse = getIngredientResponse(['unit', 'units']);
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(ingredient));
    const getIngredient = jest.spyOn(ingredientService, 'getIngredient');
    await api
      .post(getIngredientUrl)
      .send({ ...getIngredientRequestBody, query: {} })
      .expect(HttpStatus.OK)
      .expect(ingredientResponse);
    expect(getIngredient).toHaveBeenCalledTimes(1);
    expect(getIngredient).toHaveBeenCalledWith(select);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(getIngredientDetailPattern, select);
  });

  it(createTestName('get ingredient failed with undefined field', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const undefinedFieldRequestBody = {
      ...getIngredientRequestBody,
      categoryId: Date.now().toString(),
    };
    const send = jest.spyOn(clientProxy, 'send');
    const getIngredient = jest.spyOn(ingredientService, 'getIngredient');
    const response = await api
      .post(getIngredientUrl)
      .send(undefinedFieldRequestBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/);
    expect(response.body).toEqual({ messages: expect.any(Array) });
    expect(getIngredient).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(createTestName('get ingredient failed with database disconnect', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new BadRequestException(PrismaDisconnectError.message)));
    const getIngredient = jest.spyOn(ingredientService, 'getIngredient');
    await api
      .post(getIngredientUrl)
      .send(getIngredientRequestBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.COMMON.DATABASE_DISCONNECT));
    expect(getIngredient).toHaveBeenCalledTimes(1);
    expect(getIngredient).toHaveBeenCalledWith(select);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(getIngredientDetailPattern, select);
  });
});

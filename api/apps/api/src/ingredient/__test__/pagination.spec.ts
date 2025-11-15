/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { BadRequestException, HttpStatus, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { expect } from '@jest/globals';
import { ValidationError } from 'class-validator';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { ClientProxy } from '@nestjs/microservices';
import TestAgent from 'supertest/lib/agent';
import startUp from './pre-setup';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import { PrismaDisconnectError } from '@share/test/pre-setup/mock/errors/prisma-errors';
import { paginationPattern } from '@share/pattern';
import { createDescribeTest, createTestName } from '@share/test/helpers';
import IngredientService from '../ingredient.service';
import IngredientController from '../ingredient.controller';
import messages from '@share/constants/messages';
import { HTTP_METHOD } from '@share/enums';
import { createMessages } from '@share/utils';
import { createIngredients, ingredient } from '@share/test/pre-setup/mock/data/ingredient';
import { IngredientSelect } from '@share/dto/validators/ingredient.dto';
import { PaginationIngredientSerializer } from '@share/dto/serializer/ingredient';
const paginationIngredientUrl: string = '/ingredient/pagination';

const paginationBody: any = {
  pageSize: 10,
  pageNumber: 1,
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
};

const getResponseList = (groups: string[]): any => {
  return instanceToPlain(response.list, { groups });
};

const length: number = 2;
const responseData = {
  list: createIngredients(length),
  total: length,
};
const query = instanceToPlain(plainToInstance(IngredientSelect, IngredientSelect.plain(paginationBody.query)));
const select = { ...paginationBody, query };
const response = new PaginationIngredientSerializer(responseData);

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

describe(createDescribeTest(HTTP_METHOD.POST, paginationIngredientUrl), () => {
  it(createTestName('pagination ingredient success without attach unit and units fields', HttpStatus.OK), async () => {
    expect.hasAssertions();
    const query: any = {
      name: true,
      avatar: true,
      count: true,
      expiredTime: true,
      status: true,
      price: true,
      disabled: true,
    };

    const queries = instanceToPlain(plainToInstance(IngredientSelect, IngredientSelect.plain(query)));
    const selects = { ...paginationBody, query: queries };
    const logError = jest.spyOn(ingredientController as any, 'logError');
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(responseData));
    const paginationService = jest.spyOn(ingredientService, 'pagination');
    await api
      .post(paginationIngredientUrl)
      .send({
        ...paginationBody,
        query,
      })
      .expect(HttpStatus.OK)
      .expect('Content-Type', /application\/json/)
      .expect({
        total: response.total,
        list: getResponseList([]),
      });
    expect(paginationService).toHaveBeenCalledTimes(1);
    expect(paginationService).toHaveBeenCalledWith(selects);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(paginationPattern, selects);
    expect(logError).not.toHaveBeenCalled();
  });

  it(createTestName('pagination ingredient success with attach unit field', HttpStatus.OK), async () => {
    expect.hasAssertions();
    const queries = instanceToPlain(
      plainToInstance(
        IngredientSelect,
        IngredientSelect.plain({
          unit: true,
        } as any),
      ),
    );
    const selects = { ...paginationBody, query: queries };
    const logError = jest.spyOn(ingredientController as any, 'logError');
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(responseData));
    const paginationService = jest.spyOn(ingredientService, 'pagination');
    await api
      .post(paginationIngredientUrl)
      .send({
        ...paginationBody,
        query: {
          unit: true,
        },
      })
      .expect(HttpStatus.OK)
      .expect('Content-Type', /application\/json/)
      .expect({
        total: response.total,
        list: getResponseList(['unit']),
      });
    expect(paginationService).toHaveBeenCalledTimes(1);
    expect(paginationService).toHaveBeenCalledWith(selects);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(paginationPattern, selects);
    expect(logError).not.toHaveBeenCalled();
  });

  it(createTestName('pagination ingredient success with attach units field', HttpStatus.OK), async () => {
    expect.hasAssertions();
    const queries = instanceToPlain(
      plainToInstance(
        IngredientSelect,
        IngredientSelect.plain({
          units: true,
        } as any),
      ),
    );
    const selects = { ...paginationBody, query: queries };
    const logError = jest.spyOn(ingredientController as any, 'logError');
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(responseData));
    const paginationService = jest.spyOn(ingredientService, 'pagination');
    await api
      .post(paginationIngredientUrl)
      .send({
        ...paginationBody,
        query: {
          units: true,
        },
      })
      .expect(HttpStatus.OK)
      .expect('Content-Type', /application\/json/)
      .expect({
        total: response.total,
        list: getResponseList(['units']),
      });
    expect(paginationService).toHaveBeenCalledTimes(1);
    expect(paginationService).toHaveBeenCalledWith(selects);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(paginationPattern, selects);
    expect(logError).not.toHaveBeenCalled();
  });

  it(createTestName('pagination ingredient success', HttpStatus.OK), async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(ingredientController as any, 'logError');
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(responseData));
    const paginationService = jest.spyOn(ingredientService, 'pagination');
    await api
      .post(paginationIngredientUrl)
      .send(paginationBody)
      .expect(HttpStatus.OK)
      .expect('Content-Type', /application\/json/)
      .expect({
        total: response.total,
        list: getResponseList(['units', 'unit']),
      });
    expect(paginationService).toHaveBeenCalledTimes(1);
    expect(paginationService).toHaveBeenCalledWith(select);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(paginationPattern, select);
    expect(logError).not.toHaveBeenCalled();
  });

  it(createTestName('pagination ingredient success with keyword', HttpStatus.OK), async () => {
    expect.hasAssertions();
    const paginationBodyWithKeyword = {
      ...paginationBody,
      search: ingredient.name,
    };

    const selectWithKeyword = {
      ...select,
      search: paginationBodyWithKeyword.search,
    };

    const logError = jest.spyOn(ingredientController as any, 'logError');
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(responseData));
    const paginationService = jest.spyOn(ingredientService, 'pagination');
    await api
      .post(paginationIngredientUrl)
      .send(paginationBodyWithKeyword)
      .expect(HttpStatus.OK)
      .expect('Content-Type', /application\/json/)
      .expect({
        total: response.total,
        list: getResponseList(['units', 'unit']),
      });
    expect(paginationService).toHaveBeenCalledTimes(1);
    expect(paginationService).toHaveBeenCalledWith(selectWithKeyword);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(paginationPattern, selectWithKeyword);
    expect(logError).not.toHaveBeenCalled();
  });

  it(createTestName('pagination ingredient failed with output validate', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const validateErrors = [new ValidationError()];
    const logError = jest.spyOn(ingredientController as any, 'logError');
    jest.spyOn(PaginationIngredientSerializer.prototype, 'validate').mockResolvedValue(validateErrors);
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(responseData));
    const paginationService = jest.spyOn(ingredientService, 'pagination');
    await api
      .post(paginationIngredientUrl)
      .send(paginationBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.COMMON.OUTPUT_VALIDATE));
    expect(paginationService).toHaveBeenCalledTimes(1);
    expect(paginationService).toHaveBeenCalledWith(select);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(paginationPattern, select);
    expect(logError).toHaveBeenCalledTimes(1);
    expect(logError).toHaveBeenCalledWith(validateErrors, expect.any(String));
  });

  it(createTestName('pagination ingredient failed with not found error', HttpStatus.NOT_FOUND), async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(ingredientController as any, 'logError');
    const notFoundResponse = {
      list: [],
      total: 0,
    };
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new NotFoundException(notFoundResponse)));
    const paginationService = jest.spyOn(ingredientService, 'pagination');
    await api
      .post(paginationIngredientUrl)
      .send(paginationBody)
      .expect(HttpStatus.NOT_FOUND)
      .expect('Content-Type', /application\/json/)
      .expect(notFoundResponse);
    expect(paginationService).toHaveBeenCalledTimes(1);
    expect(paginationService).toHaveBeenCalledWith(select);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(paginationPattern, select);
    expect(logError).not.toHaveBeenCalled();
  });

  it(createTestName('pagination ingredient failed with unknown error', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(ingredientController as any, 'logError');
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => UnknownError));
    const paginationService = jest.spyOn(ingredientService, 'pagination');
    await api
      .post(paginationIngredientUrl)
      .send(paginationBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(UnknownError.message));
    expect(paginationService).toHaveBeenCalledTimes(1);
    expect(paginationService).toHaveBeenCalledWith(select);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(paginationPattern, select);
    expect(logError).not.toHaveBeenCalled();
  });

  it(createTestName('pagination ingredient failed with server error', HttpStatus.INTERNAL_SERVER_ERROR), async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(ingredientController as any, 'logError');
    const serverError = new InternalServerErrorException();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => serverError));
    const paginationService = jest.spyOn(ingredientService, 'pagination');
    await api
      .post(paginationIngredientUrl)
      .send(paginationBody)
      .expect(HttpStatus.INTERNAL_SERVER_ERROR)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(serverError.message));
    expect(paginationService).toHaveBeenCalledTimes(1);
    expect(paginationService).toHaveBeenCalledWith(select);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(paginationPattern, select);
    expect(logError).not.toHaveBeenCalled();
  });

  it(createTestName('pagination ingredient failed with missing field', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(ingredientController as any, 'logError');
    const missingQueryFieldBody = {
      pageSize: paginationBody.pageSize,
      pageNumber: paginationBody.pageNumber,
    };
    const send = jest.spyOn(clientProxy, 'send');
    const paginationService = jest.spyOn(ingredientService, 'pagination');
    const response = await api
      .post(paginationIngredientUrl)
      .send(missingQueryFieldBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/);
    expect(response.body).toEqual({ messages: expect.any(Array) });
    expect(paginationService).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
    expect(logError).not.toHaveBeenCalled();
  });

  it(createTestName('pagination ingredient failed with undefined field', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(ingredientController as any, 'logError');
    const undefinedFieldRequestBody = {
      pageSize: paginationBody.pageSize,
      pageNumber: paginationBody.pageNumber,
      query: paginationBody.query,
      ingredientId: Date.now().toString(),
    };
    const send = jest.spyOn(clientProxy, 'send');
    const paginationService = jest.spyOn(ingredientService, 'pagination');
    const response = await api
      .post(paginationIngredientUrl)
      .send(undefinedFieldRequestBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/);
    expect(response.body).toEqual({ messages: expect.any(Array) });
    expect(paginationService).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
    expect(logError).not.toHaveBeenCalled();
  });

  it(createTestName('pagination ingredient failed with database disconnect', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(ingredientController as any, 'logError');
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new BadRequestException(PrismaDisconnectError.message)));
    const paginationService = jest.spyOn(ingredientService, 'pagination');
    await api
      .post(paginationIngredientUrl)
      .send(paginationBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.COMMON.DATABASE_DISCONNECT));
    expect(paginationService).toHaveBeenCalledTimes(1);
    expect(paginationService).toHaveBeenCalledWith(select);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(paginationPattern, select);
    expect(logError).not.toHaveBeenCalled();
  });

  it(createTestName('pagination ingredient success with empty query', HttpStatus.OK), async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(ingredientController as any, 'logError');
    const paginationEmptyQueryRequestBody = {
      ...paginationBody,
      query: {},
    };
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(responseData));
    const paginationService = jest.spyOn(ingredientService, 'pagination');
    await api
      .post(paginationIngredientUrl)
      .send(paginationEmptyQueryRequestBody)
      .expect(HttpStatus.OK)
      .expect('Content-Type', /application\/json/)
      .expect({
        total: response.total,
        list: getResponseList(['units', 'unit']),
      });
    expect(paginationService).toHaveBeenCalledTimes(1);
    expect(paginationService).toHaveBeenCalledWith(select);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(paginationPattern, select);
    expect(logError).not.toHaveBeenCalled();
  });
});

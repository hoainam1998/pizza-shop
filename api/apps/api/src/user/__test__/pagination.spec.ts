import {
  BadRequestException,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  RequestMethod,
} from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { expect } from '@jest/globals';
import { ValidationError } from 'class-validator';
import { instanceToPlain } from 'class-transformer';
import { ClientProxy } from '@nestjs/microservices';
import TestAgent from 'supertest/lib/agent';
import startUp from './pre-setup';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import { PrismaDisconnectError } from '@share/test/pre-setup/mock/errors/prisma-errors';
import { paginationPattern } from '@share/pattern';
import { createDescribeTest, createTestName, getMockModule } from '@share/test/helpers';
import UserService from '../user.service';
import UserController from '../user.controller';
import UserModule from '../user.module';
import messages from '@share/constants/messages';
import { HTTP_METHOD, POWER_NUMERIC } from '@share/enums';
import { createMessage, createMessages } from '@share/utils';
import { user, createUsers, sessionPayload } from '@share/test/pre-setup/mock/data/user';
import { UserQuery } from '@share/dto/validators/user.dto';
import { PaginationUserSerializer } from '@share/dto/serializer/user';
import { UserRouter } from '@share/router';
const paginationUserUrl: string = UserRouter.absolute.pagination;
const MockUserModule = getMockModule(UserModule, {
  path: paginationUserUrl,
  method: RequestMethod.POST,
});

const paginationBody: Record<string, any> = {
  pageSize: 10,
  pageNumber: 1,
  query: {
    avatar: true,
    firstName: true,
    lastName: true,
    phone: true,
    email: true,
    sex: true,
    power: true,
  },
};

const length: number = 2;
const responseData: any = {
  list: createUsers(length),
  total: length,
};
const query = UserQuery.plain(paginationBody.query);
const select = { ...paginationBody, query, requesterId: sessionPayload!.userId };
const response = new PaginationUserSerializer(responseData);
const invalidPowerSessionPayload = { ...sessionPayload, power: POWER_NUMERIC.SALE };

let api: TestAgent;
let clientProxy: ClientProxy;
let close: () => Promise<void>;
let userService: UserService;
let userController: UserController;

beforeAll(async () => {
  const requestTest = await startUp(MockUserModule);
  api = requestTest.api;
  clientProxy = requestTest.clientProxy;
  close = () => requestTest.app.close();
  userService = requestTest.app.get(UserService);
  userController = requestTest.app.get(UserController);
});

afterEach(async () => {
  if (close) {
    await close();
  }
});

describe(createDescribeTest(HTTP_METHOD.POST, paginationUserUrl), () => {
  it(createTestName('pagination user success', HttpStatus.OK), async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(userController as any, 'logError');
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(responseData));
    const paginationService = jest.spyOn(userService, 'pagination');
    await api
      .post(paginationUserUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(paginationBody)
      .expect(HttpStatus.OK)
      .expect('Content-Type', /application\/json/)
      .expect({
        total: response.total,
        list: instanceToPlain(response.list),
      });
    expect(paginationService).toHaveBeenCalledTimes(1);
    expect(paginationService).toHaveBeenCalledWith(select);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(paginationPattern, select);
    expect(logError).not.toHaveBeenCalled();
  });

  it(createTestName('pagination user failed with authentication error', HttpStatus.UNAUTHORIZED), async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(userController as any, 'logError');
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(responseData));
    const paginationService = jest.spyOn(userService, 'pagination');
    await api
      .post(paginationUserUrl)
      .send(paginationBody)
      .expect(HttpStatus.UNAUTHORIZED)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.DID_NOT_LOGIN));
    expect(paginationService).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
    expect(logError).not.toHaveBeenCalled();
  });

  it(createTestName('pagination user failed with user have not permission', HttpStatus.UNAUTHORIZED), async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(userController as any, 'logError');
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(responseData));
    const paginationService = jest.spyOn(userService, 'pagination');
    await api
      .post(paginationUserUrl)
      .set('mock-session', JSON.stringify(invalidPowerSessionPayload))
      .send(paginationBody)
      .expect(HttpStatus.UNAUTHORIZED)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.DO_NOT_PERMISSION));
    expect(paginationService).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
    expect(logError).not.toHaveBeenCalled();
  });

  it(createTestName('pagination user success with keyword', HttpStatus.OK), async () => {
    expect.hasAssertions();
    const paginationBodyWithKeyword = {
      ...paginationBody,
      search: user.last_name,
    };

    const selectWithKeyword = {
      ...select,
      search: paginationBodyWithKeyword.search,
    };

    const logError = jest.spyOn(userController as any, 'logError');
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(responseData));
    const paginationService = jest.spyOn(userService, 'pagination');
    await api
      .post(paginationUserUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(paginationBodyWithKeyword)
      .expect(HttpStatus.OK)
      .expect('Content-Type', /application\/json/)
      .expect({
        total: response.total,
        list: instanceToPlain(response.list),
      });
    expect(paginationService).toHaveBeenCalledTimes(1);
    expect(paginationService).toHaveBeenCalledWith(selectWithKeyword);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(paginationPattern, selectWithKeyword);
    expect(logError).not.toHaveBeenCalled();
  });

  it(createTestName('pagination user failed with output validate', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const validateErrors = [new ValidationError()];
    const logError = jest.spyOn(userController as any, 'logError');
    jest.spyOn(PaginationUserSerializer.prototype, 'validate').mockResolvedValue(validateErrors);
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(responseData));
    const paginationService = jest.spyOn(userService, 'pagination');
    await api
      .post(paginationUserUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
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

  it(createTestName('pagination user failed with not found error', HttpStatus.NOT_FOUND), async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(userController as any, 'logError');
    const notFoundResponse = {
      list: [],
      total: 0,
    };
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new NotFoundException(notFoundResponse)));
    const paginationService = jest.spyOn(userService, 'pagination');
    await api
      .post(paginationUserUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
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

  it(createTestName('pagination user failed with unknown error', HttpStatus.INTERNAL_SERVER_ERROR), async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(userController as any, 'logError');
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => UnknownError));
    const paginationService = jest.spyOn(userService, 'pagination');
    await api
      .post(paginationUserUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(paginationBody)
      .expect(HttpStatus.INTERNAL_SERVER_ERROR)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(new InternalServerErrorException().message));
    expect(paginationService).toHaveBeenCalledTimes(1);
    expect(paginationService).toHaveBeenCalledWith(select);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(paginationPattern, select);
    expect(logError).not.toHaveBeenCalled();
  });

  it(createTestName('pagination user failed with RPC unknown error', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(userController as any, 'logError');
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new BadRequestException(createMessage(messages.COMMON.COMMON_ERROR))));
    const paginationService = jest.spyOn(userService, 'pagination');
    await api
      .post(paginationUserUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(paginationBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.COMMON.COMMON_ERROR));
    expect(paginationService).toHaveBeenCalledTimes(1);
    expect(paginationService).toHaveBeenCalledWith(select);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(paginationPattern, select);
    expect(logError).not.toHaveBeenCalled();
  });

  it(createTestName('pagination user failed with server error', HttpStatus.INTERNAL_SERVER_ERROR), async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(userController as any, 'logError');
    const serverError = new InternalServerErrorException();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => serverError));
    const paginationService = jest.spyOn(userService, 'pagination');
    await api
      .post(paginationUserUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
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

  it(createTestName('pagination user failed with missing field', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(userController as any, 'logError');
    const missingQueryFieldBody = {
      pageSize: paginationBody.pageSize,
      pageNumber: paginationBody.pageNumber,
    };
    const send = jest.spyOn(clientProxy, 'send');
    const paginationService = jest.spyOn(userService, 'pagination');
    const response = await api
      .post(paginationUserUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(missingQueryFieldBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/);
    expect(response.body).toEqual({ messages: expect.any(Array) });
    expect(paginationService).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
    expect(logError).not.toHaveBeenCalled();
  });

  it(createTestName('pagination user failed with undefined field', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(userController as any, 'logError');
    const undefinedFieldRequestBody = {
      pageSize: paginationBody.pageSize,
      pageNumber: paginationBody.pageNumber,
      query: paginationBody.query,
      userIds: [Date.now().toString()],
    };
    const send = jest.spyOn(clientProxy, 'send');
    const paginationService = jest.spyOn(userService, 'pagination');
    const response = await api
      .post(paginationUserUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(undefinedFieldRequestBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/);
    expect(response.body).toEqual({ messages: expect.any(Array) });
    expect(paginationService).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
    expect(logError).not.toHaveBeenCalled();
  });

  it(createTestName('pagination user failed with database disconnect', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(userController as any, 'logError');
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new BadRequestException(PrismaDisconnectError.message)));
    const paginationService = jest.spyOn(userService, 'pagination');
    await api
      .post(paginationUserUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
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

  it(createTestName('pagination user success with empty query', HttpStatus.OK), async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(userController as any, 'logError');
    const paginationEmptyQueryRequestBody = {
      ...paginationBody,
      query: {},
    };
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(responseData));
    const paginationService = jest.spyOn(userService, 'pagination');
    await api
      .post(paginationUserUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(paginationEmptyQueryRequestBody)
      .expect(HttpStatus.OK)
      .expect('Content-Type', /application\/json/)
      .expect({
        total: response.total,
        list: instanceToPlain(response.list),
      });
    expect(paginationService).toHaveBeenCalledTimes(1);
    expect(paginationService).toHaveBeenCalledWith(select);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(paginationPattern, select);
    expect(logError).not.toHaveBeenCalled();
  });
});

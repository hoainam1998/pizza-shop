import {
  BadRequestException,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  RequestMethod,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { of, throwError } from 'rxjs';
import { expect } from '@jest/globals';
import { ValidationError } from 'class-validator';
import TestAgent from 'supertest/lib/agent';
import startUp from './pre-setup';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import { PrismaDisconnectError } from '@share/test/pre-setup/mock/errors/prisma-errors';
import { getUserDetailPattern } from '@share/pattern';
import { user as originUser, apiKey } from '@share/test/pre-setup/mock/data/user';
import { sessionPayload } from '@share/test/pre-setup/mock/data/user';
import { createDescribeTest, createTestName, getMockModule } from '@share/test/helpers';
import UserService from '../user.service';
import UserController from '../user.controller';
import UserModule from '../user.module';
import messages from '@share/constants/messages';
import constants from '@share/constants';
import { HTTP_METHOD, POWER_NUMERIC } from '@share/enums';
import { createMessage, createMessages, signApiKey } from '@share/utils';
import { UserRouter } from '@share/router';
import { UserDetail } from '@share/dto/validators/user.dto';
import { UserSerializer } from '@share/dto/serializer/user';
const user: Partial<typeof originUser> = Object.assign({}, originUser);
delete user.reset_password_token;
delete user.password;
delete user.plain_password;
delete user.session_id;
delete user.reset_password_link;
const getUserUrl: string = UserRouter.absolute.detail;
const MockUserModule = getMockModule(UserModule, { path: getUserUrl, method: RequestMethod.POST });

const getUserRequestBody = {
  userId: Date.now().toString(),
  query: {
    firstName: true,
    lastName: true,
    email: true,
    phone: true,
    power: true,
    sex: true,
    avatar: true,
  },
};
const select = UserDetail.plain(getUserRequestBody);
const userPlain = UserSerializer.plain(user);
const invalidPowerSessionPayload = { ...sessionPayload, power: POWER_NUMERIC.SALE };
const missMatchUserIdApiKey = signApiKey({ userId: Date.now().toString(), email: user.email, power: user.power });

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

describe(createDescribeTest(HTTP_METHOD.POST, getUserUrl), () => {
  it(createTestName('get user detail success', HttpStatus.OK), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(user));
    const getUserService = jest.spyOn(userService, 'getUserDetail');
    await api
      .post(getUserUrl)
      .set('Cookie', [`${constants.IMPACT_USER_API_KEY}=${missMatchUserIdApiKey}`])
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(getUserRequestBody)
      .expect(HttpStatus.OK)
      .expect('Content-Type', /application\/json/)
      .expect(userPlain);
    expect(getUserService).toHaveBeenCalledTimes(1);
    expect(getUserService).toHaveBeenCalledWith(select);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(getUserDetailPattern, select);
  });

  it(createTestName('get user detail failed with authentication error', HttpStatus.UNAUTHORIZED), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(user));
    const getUserService = jest.spyOn(userService, 'getUserDetail');
    await api
      .post(getUserUrl)
      .send(getUserRequestBody)
      .expect(HttpStatus.UNAUTHORIZED)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.DID_NOT_LOGIN));
    expect(getUserService).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(createTestName('get user detail failed with API key not set', HttpStatus.UNAUTHORIZED), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(user));
    const getUserService = jest.spyOn(userService, 'getUserDetail');
    await api
      .post(getUserUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(getUserRequestBody)
      .expect(HttpStatus.UNAUTHORIZED)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.API_KEY_INVALID));
    expect(getUserService).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(createTestName('get user detail failed when update self information', HttpStatus.UNAUTHORIZED), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(user));
    const getUserService = jest.spyOn(userService, 'getUserDetail');
    await api
      .post(getUserUrl)
      .set('Cookie', [`${constants.IMPACT_USER_API_KEY}=${apiKey}`])
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(getUserRequestBody)
      .expect(HttpStatus.UNAUTHORIZED)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.DO_NOT_CHANGE_YOURSELF));
    expect(getUserService).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(createTestName('get user detail failed when user have not permission', HttpStatus.UNAUTHORIZED), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(user));
    const getUserService = jest.spyOn(userService, 'getUserDetail');
    await api
      .post(getUserUrl)
      .set('Cookie', [`${constants.IMPACT_USER_API_KEY}=${apiKey}`])
      .set('mock-session', JSON.stringify(invalidPowerSessionPayload))
      .send(getUserRequestBody)
      .expect(HttpStatus.UNAUTHORIZED)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.DO_NOT_PERMISSION));
    expect(getUserService).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(createTestName('get user detail failed with output validate', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const validatorErrors = [new ValidationError()];
    const logError = jest.spyOn(userController as any, 'logError').mockImplementation(() => jest.fn());
    jest.spyOn(UserSerializer.prototype, 'validate').mockResolvedValue(validatorErrors);
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(user));
    const getUserService = jest.spyOn(userService, 'getUserDetail');
    await api
      .post(getUserUrl)
      .set('Cookie', [`${constants.IMPACT_USER_API_KEY}=${missMatchUserIdApiKey}`])
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(getUserRequestBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.COMMON.OUTPUT_VALIDATE));
    expect(getUserService).toHaveBeenCalledTimes(1);
    expect(getUserService).toHaveBeenCalledWith(select);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(getUserDetailPattern, select);
    expect(logError).toHaveBeenCalledTimes(1);
    expect(logError).toHaveBeenCalledWith(validatorErrors, expect.any(String));
  });

  it(createTestName('get user detail failed with not found error', HttpStatus.NOT_FOUND), async () => {
    expect.hasAssertions();
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new NotFoundException(createMessage(messages.USER.NOT_FOUND))));
    const getUserService = jest.spyOn(userService, 'getUserDetail');
    await api
      .post(getUserUrl)
      .set('Cookie', [`${constants.IMPACT_USER_API_KEY}=${missMatchUserIdApiKey}`])
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(getUserRequestBody)
      .expect(HttpStatus.NOT_FOUND)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.NOT_FOUND));
    expect(getUserService).toHaveBeenCalledTimes(1);
    expect(getUserService).toHaveBeenCalledWith(select);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(getUserDetailPattern, select);
  });

  it(createTestName('get user detail failed with unknown error', HttpStatus.INTERNAL_SERVER_ERROR), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => UnknownError));
    const getUserService = jest.spyOn(userService, 'getUserDetail');
    await api
      .post(getUserUrl)
      .set('Cookie', [`${constants.IMPACT_USER_API_KEY}=${missMatchUserIdApiKey}`])
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(getUserRequestBody)
      .expect(HttpStatus.INTERNAL_SERVER_ERROR)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(new InternalServerErrorException().message));
    expect(getUserService).toHaveBeenCalledTimes(1);
    expect(getUserService).toHaveBeenCalledWith(select);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(getUserDetailPattern, select);
  });

  it(createTestName('get user detail failed with RPC unknown error', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new BadRequestException(createMessage(messages.COMMON.COMMON_ERROR))));
    const getUserService = jest.spyOn(userService, 'getUserDetail');
    await api
      .post(getUserUrl)
      .set('Cookie', [`${constants.IMPACT_USER_API_KEY}=${missMatchUserIdApiKey}`])
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(getUserRequestBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.COMMON.COMMON_ERROR));
    expect(getUserService).toHaveBeenCalledTimes(1);
    expect(getUserService).toHaveBeenCalledWith(select);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(getUserDetailPattern, select);
  });

  it(createTestName('get user detail failed with server error', HttpStatus.INTERNAL_SERVER_ERROR), async () => {
    expect.hasAssertions();
    const serverError = new InternalServerErrorException();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => serverError));
    const getUserService = jest.spyOn(userService, 'getUserDetail');
    await api
      .post(getUserUrl)
      .set('Cookie', [`${constants.IMPACT_USER_API_KEY}=${missMatchUserIdApiKey}`])
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(getUserRequestBody)
      .expect(HttpStatus.INTERNAL_SERVER_ERROR)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(serverError.message));
    expect(getUserService).toHaveBeenCalledTimes(1);
    expect(getUserService).toHaveBeenCalledWith(select);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(getUserDetailPattern, select);
  });

  it(createTestName('get user detail failed with missing field', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const missingQueryFieldBody = {
      userId: getUserRequestBody.userId,
    };
    const send = jest.spyOn(clientProxy, 'send');
    const getUserService = jest.spyOn(userService, 'getUserDetail');
    const response = await api
      .post(getUserUrl)
      .set('Cookie', [`${constants.IMPACT_USER_API_KEY}=${missMatchUserIdApiKey}`])
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(missingQueryFieldBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/);
    expect(response.body).toEqual({ messages: expect.any(Array) });
    expect(getUserService).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(createTestName('get user detail failed with undefined field', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const undefinedFieldBody = {
      ...getUserRequestBody,
      userIds: [Date.now().toString()],
    };
    const send = jest.spyOn(clientProxy, 'send');
    const getUserService = jest.spyOn(userService, 'getUserDetail');
    const response = await api
      .post(getUserUrl)
      .set('Cookie', [`${constants.IMPACT_USER_API_KEY}=${missMatchUserIdApiKey}`])
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(undefinedFieldBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/);
    expect(response.body).toEqual({ messages: expect.any(Array) });
    expect(getUserService).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(createTestName('get user detail success with empty query field', HttpStatus.OK), async () => {
    expect.hasAssertions();
    const queryFieldEmptyBody = {
      userId: getUserRequestBody.userId,
      query: {},
    };
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(user));
    const getUserService = jest.spyOn(userService, 'getUserDetail');
    await api
      .post(getUserUrl)
      .set('Cookie', [`${constants.IMPACT_USER_API_KEY}=${missMatchUserIdApiKey}`])
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(queryFieldEmptyBody)
      .expect(HttpStatus.OK)
      .expect('Content-Type', /application\/json/);
    expect(getUserService).toHaveBeenCalledTimes(1);
    expect(getUserService).toHaveBeenCalledWith(select);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(getUserDetailPattern, select);
  });

  it(createTestName('get user failed with database disconnect', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new BadRequestException(PrismaDisconnectError.message)));
    const getUserService = jest.spyOn(userService, 'getUserDetail');
    await api
      .post(getUserUrl)
      .set('Cookie', [`${constants.IMPACT_USER_API_KEY}=${missMatchUserIdApiKey}`])
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(getUserRequestBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.COMMON.DATABASE_DISCONNECT));
    expect(getUserService).toHaveBeenCalledTimes(1);
    expect(getUserService).toHaveBeenCalledWith(select);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(getUserDetailPattern, select);
  });
});

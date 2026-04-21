import {
  BadRequestException,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { instanceToPlain } from 'class-transformer';
import { UserRouter } from '@share/router';
import TestAgent from 'supertest/lib/agent';
import { ClientProxy } from '@nestjs/microservices';
import UserService from '../user.service';
import { LoginSerializer } from '@share/dto/serializer/user';
import startUp from './pre-setup';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import { apiKey, user as originUser, resetPasswordToken } from '@share/test/pre-setup/mock/data/user';
import { APP_NAME, HTTP_METHOD } from '@share/enums';
import { createDescribeTest, createTestName } from '@share/test/helpers';
import { loginPattern } from '@share/pattern';
import { createMessage, createMessages, omitFields } from '@share/utils';
import messages from '@share/constants/messages';
import { PrismaDisconnectError } from '@share/test/pre-setup/mock/errors/prisma-errors';
import { LoginInfo } from '@share/dto/validators/user.dto';
import { UserLoggedType } from '@share/interfaces';
const user: Omit<typeof originUser, 'reset_password_link'> & {
  reset_password_link?: string;
} = { ...originUser, api_key: apiKey };
delete user.reset_password_link;
const loginUrl = UserRouter.absolute.login;

let api: TestAgent;
let clientProxy: ClientProxy;
let close: () => Promise<void>;
let userService: UserService;

const loginInfo: any = {
  email: user.email,
  password: user.password,
};

const loginPayload: LoginInfo = {
  ...loginInfo,
  session_id: expect.any(String),
  by: expect.any(String),
};

const userExpected = omitFields(['password', 'plain_password', 'session_id'], {
  ...user,
  reset_password_token: null,
}) as UserLoggedType;
const loginSerializer = new LoginSerializer(userExpected);
const userPlain = instanceToPlain(loginSerializer);
const userSerializer = {
  isFirstTime: userPlain.isFirstTime,
  resetPasswordToken: userPlain.resetPasswordToken,
  userLoggedToken: expect.any(String),
  apiKey: expect.any(String),
};

beforeAll(async () => {
  const requestTest = await startUp();
  api = requestTest.api;
  clientProxy = requestTest.clientProxy;
  close = () => requestTest.app.close();
  userService = requestTest.app.get(UserService);
});

afterEach(async () => {
  if (close) {
    await close();
  }
});

describe(createDescribeTest(HTTP_METHOD.POST, loginUrl), () => {
  it(createTestName('login success', HttpStatus.OK), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(userExpected));
    const loginService = jest.spyOn(userService, 'login');
    const response = await api
      .post(loginUrl)
      .set('Cookie', [`app=${APP_NAME.ADMIN}`])
      .send(loginInfo)
      .expect(HttpStatus.OK)
      .expect('Content-Type', /application\/json/);
    expect(response.body).toEqual(userSerializer);
    expect(loginService).toHaveBeenCalledTimes(1);
    expect(loginService).toHaveBeenCalledWith(loginPayload);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(loginPattern, loginPayload);
    expect(response.headers['set-cookie']).toEqual([expect.any(String)]);
  });

  it(createTestName('login success for first time', HttpStatus.OK), async () => {
    expect.hasAssertions();
    const userExpected = omitFields(['password', 'plain_password', 'session_id'], {
      ...user,
      reset_password_token: resetPasswordToken,
    }) as UserLoggedType;
    const loginSerializer = new LoginSerializer(userExpected);
    const userPlain = instanceToPlain(loginSerializer);
    const userSerializer = {
      isFirstTime: userPlain.isFirstTime,
      resetPasswordToken: userPlain.resetPasswordToken,
      userLoggedToken: null,
      apiKey: null,
    };
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(userExpected));
    const loginService = jest.spyOn(userService, 'login');
    const response = await api
      .post(loginUrl)
      .set('Cookie', [`app=${APP_NAME.ADMIN}`])
      .send(loginInfo)
      .expect(HttpStatus.OK)
      .expect('Content-Type', /application\/json/);
    expect(response.body).toEqual(userSerializer);
    expect(loginService).toHaveBeenCalledTimes(1);
    expect(loginService).toHaveBeenCalledWith(loginPayload);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(loginPattern, loginPayload);
    expect(response.headers['set-cookie']).not.toBeDefined();
  });

  it(createTestName('login failed with sale view and admin role', HttpStatus.UNAUTHORIZED), async () => {
    expect.hasAssertions();
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new UnauthorizedException(createMessage(messages.USER.NOT_ALLOW_ADMIN_LOGIN))));
    const loginService = jest.spyOn(userService, 'login');
    await api
      .post(loginUrl)
      .set('Cookie', [`app=${APP_NAME.SALE}`])
      .send(loginInfo)
      .expect(HttpStatus.UNAUTHORIZED)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.NOT_ALLOW_ADMIN_LOGIN));
    expect(loginService).toHaveBeenCalledTimes(1);
    expect(loginService).toHaveBeenCalledWith(loginPayload);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(loginPattern, loginPayload);
  });

  it(createTestName('login failed with admin view and sale role', HttpStatus.UNAUTHORIZED), async () => {
    expect.hasAssertions();
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new UnauthorizedException(createMessage(messages.USER.NOT_ALLOW_SALE_LOGIN))));
    const loginService = jest.spyOn(userService, 'login');
    await api
      .post(loginUrl)
      .set('Cookie', [`app=${APP_NAME.ADMIN}`])
      .send(loginInfo)
      .expect(HttpStatus.UNAUTHORIZED)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.NOT_ALLOW_SALE_LOGIN));
    expect(loginService).toHaveBeenCalledTimes(1);
    expect(loginService).toHaveBeenCalledWith(loginPayload);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(loginPattern, loginPayload);
  });

  it(createTestName('login failed when unknown resource', HttpStatus.UNAUTHORIZED), async () => {
    expect.hasAssertions();
    const newLoginInfoExpect = { ...loginPayload, by: undefined };
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new UnauthorizedException(createMessage(messages.COMMON.UNKNOWN_RESOURCE))));
    const loginService = jest.spyOn(userService, 'login');
    await api
      .post(loginUrl)
      .send(loginInfo)
      .expect(HttpStatus.UNAUTHORIZED)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.COMMON.UNKNOWN_RESOURCE));
    expect(loginService).toHaveBeenCalledTimes(1);
    expect(loginService).toHaveBeenCalledWith(newLoginInfoExpect);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(loginPattern, newLoginInfoExpect);
  });

  it(createTestName('login failed with not found error', HttpStatus.NOT_FOUND), async () => {
    expect.hasAssertions();
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new NotFoundException(createMessage(messages.USER.NOT_FOUND))));
    const loginService = jest.spyOn(userService, 'login');
    await api
      .post(loginUrl)
      .set('Cookie', [`app=${APP_NAME.ADMIN}`])
      .send(loginInfo)
      .expect(HttpStatus.NOT_FOUND)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.NOT_FOUND));
    expect(loginService).toHaveBeenCalledTimes(1);
    expect(loginService).toHaveBeenCalledWith(loginPayload);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(loginPattern, loginPayload);
  });

  it(createTestName('login failed when password not match', HttpStatus.UNAUTHORIZED), async () => {
    expect.hasAssertions();
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new UnauthorizedException(createMessage(messages.USER.PASSWORD_NOT_MATCH))));
    const loginService = jest.spyOn(userService, 'login');
    await api
      .post(loginUrl)
      .set('Cookie', [`app=${APP_NAME.ADMIN}`])
      .send(loginInfo)
      .expect(HttpStatus.UNAUTHORIZED)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.PASSWORD_NOT_MATCH));
    expect(loginService).toHaveBeenCalledTimes(1);
    expect(loginService).toHaveBeenCalledWith(loginPayload);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(loginPattern, loginPayload);
  });

  it(createTestName('login failed with unknown error', HttpStatus.INTERNAL_SERVER_ERROR), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => UnknownError));
    const loginService = jest.spyOn(userService, 'login');
    await api
      .post(loginUrl)
      .set('Cookie', [`app=${APP_NAME.ADMIN}`])
      .send(loginInfo)
      .expect(HttpStatus.INTERNAL_SERVER_ERROR)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(new InternalServerErrorException().message));
    expect(loginService).toHaveBeenCalledTimes(1);
    expect(loginService).toHaveBeenCalledWith(loginPayload);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(loginPattern, loginPayload);
  });

  it(createTestName('login failed with rpc unknown error', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new BadRequestException(createMessage(messages.COMMON.COMMON_ERROR))));
    const loginService = jest.spyOn(userService, 'login');
    await api
      .post(loginUrl)
      .set('Cookie', [`app=${APP_NAME.ADMIN}`])
      .send(loginInfo)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.COMMON.COMMON_ERROR));
    expect(loginService).toHaveBeenCalledTimes(1);
    expect(loginService).toHaveBeenCalledWith(loginPayload);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(loginPattern, loginPayload);
  });

  it(createTestName('login failed with database disconnect error', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new BadRequestException(PrismaDisconnectError.message)));
    const loginService = jest.spyOn(userService, 'login');
    await api
      .post(loginUrl)
      .set('Cookie', [`app=${APP_NAME.ADMIN}`])
      .send(loginInfo)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.COMMON.DATABASE_DISCONNECT));
    expect(loginService).toHaveBeenCalledTimes(1);
    expect(loginService).toHaveBeenCalledWith(loginPayload);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(loginPattern, loginPayload);
  });

  it(createTestName('login failed with server error', HttpStatus.INTERNAL_SERVER_ERROR), async () => {
    expect.hasAssertions();
    const serverError = new InternalServerErrorException();
    const loginService = jest.spyOn(userService, 'login');
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => serverError));
    await api
      .post(loginUrl)
      .set('Cookie', [`app=${APP_NAME.ADMIN}`])
      .send(loginInfo)
      .expect(HttpStatus.INTERNAL_SERVER_ERROR)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(serverError.message));
    expect(loginService).toHaveBeenCalledTimes(1);
    expect(loginService).toHaveBeenCalledWith(loginPayload);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(loginPattern, loginPayload);
  });
});

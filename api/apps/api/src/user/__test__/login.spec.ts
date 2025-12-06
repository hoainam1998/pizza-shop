import { BadRequestException, HttpStatus, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { instanceToPlain } from 'class-transformer';
import { UserRouter } from '@share/router';
import TestAgent from 'supertest/lib/agent';
import { ClientProxy } from '@nestjs/microservices';
import UserService from '../user.service';
import { LoginSerializer } from '@share/dto/serializer/user';
import startUp from './pre-setup';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import { user } from '@share/test/pre-setup/mock/data/user';
import { HTTP_METHOD } from '@share/enums';
import { createDescribeTest, createTestName } from '@share/test/helpers';
import { loginPattern } from '@share/pattern';
import { createMessage, createMessages } from '@share/utils';
import messages from '@share/constants/messages';
import { PrismaDisconnectError } from '@share/test/pre-setup/mock/errors/prisma-errors';
import { LoginInfo } from '@share/dto/validators/user.dto';
import { UserRequestType } from '@share/interfaces';
const loginUrl = UserRouter.absolute.login;

let api: TestAgent;
let clientProxy: ClientProxy;
let close: () => Promise<void>;
let userService: UserService;
const loginInfo: LoginInfo = {
  email: user.email,
  password: user.password,
};

beforeEach(async () => {
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
    const userWithoutPassword: UserRequestType = { ...user };
    delete userWithoutPassword.password;
    delete userWithoutPassword.plain_password;
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(userWithoutPassword));
    const loginService = jest.spyOn(userService, 'login');
    const loginSerializer = new LoginSerializer(userWithoutPassword);
    await api
      .post(loginUrl)
      .send(loginInfo)
      .expect(HttpStatus.OK)
      .expect('Content-Type', /application\/json/)
      .expect(instanceToPlain(loginSerializer));
    expect(loginService).toHaveBeenCalledTimes(1);
    expect(loginService).toHaveBeenCalledWith(loginInfo);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(loginPattern, loginInfo);
  });

  it(createTestName('login failed with not found error', HttpStatus.NOT_FOUND), async () => {
    expect.hasAssertions();
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new NotFoundException(createMessage(messages.USER.NOT_FOUND))));
    const loginService = jest.spyOn(userService, 'login');
    await api
      .post(loginUrl)
      .send(loginInfo)
      .expect(HttpStatus.NOT_FOUND)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.NOT_FOUND));
    expect(loginService).toHaveBeenCalledTimes(1);
    expect(loginService).toHaveBeenCalledWith(loginInfo);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(loginPattern, loginInfo);
  });

  it(createTestName('login failed when password not match', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new BadRequestException(createMessage(messages.USER.PASSWORD_NOT_MATCH))));
    const loginService = jest.spyOn(userService, 'login');
    await api
      .post(loginUrl)
      .send(loginInfo)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.PASSWORD_NOT_MATCH));
    expect(loginService).toHaveBeenCalledTimes(1);
    expect(loginService).toHaveBeenCalledWith(loginInfo);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(loginPattern, loginInfo);
  });

  it(createTestName('login failed with unknown error', HttpStatus.INTERNAL_SERVER_ERROR), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => UnknownError));
    const loginService = jest.spyOn(userService, 'login');
    await api
      .post(loginUrl)
      .send(loginInfo)
      .expect(HttpStatus.INTERNAL_SERVER_ERROR)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(new InternalServerErrorException().message));
    expect(loginService).toHaveBeenCalledTimes(1);
    expect(loginService).toHaveBeenCalledWith(loginInfo);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(loginPattern, loginInfo);
  });

  it(createTestName('login failed with rpc unknown error', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new BadRequestException(createMessage(messages.COMMON.COMMON_ERROR))));
    const loginService = jest.spyOn(userService, 'login');
    await api
      .post(loginUrl)
      .send(loginInfo)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.COMMON.COMMON_ERROR));
    expect(loginService).toHaveBeenCalledTimes(1);
    expect(loginService).toHaveBeenCalledWith(loginInfo);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(loginPattern, loginInfo);
  });

  it(createTestName('login failed with database disconnect error', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new BadRequestException(PrismaDisconnectError.message)));
    const loginService = jest.spyOn(userService, 'login');
    await api
      .post(loginUrl)
      .send(loginInfo)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.COMMON.DATABASE_DISCONNECT));
    expect(loginService).toHaveBeenCalledTimes(1);
    expect(loginService).toHaveBeenCalledWith(loginInfo);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(loginPattern, loginInfo);
  });

  it(createTestName('login failed with server error', HttpStatus.INTERNAL_SERVER_ERROR), async () => {
    expect.hasAssertions();
    const serverError = new InternalServerErrorException();
    const loginService = jest.spyOn(userService, 'login');
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => serverError));
    await api
      .post(loginUrl)
      .send(loginInfo)
      .expect(HttpStatus.INTERNAL_SERVER_ERROR)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(serverError.message));
    expect(loginService).toHaveBeenCalledTimes(1);
    expect(loginService).toHaveBeenCalledWith(loginInfo);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(loginPattern, loginInfo);
  });
});

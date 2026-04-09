import {
  BadRequestException,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  RequestMethod,
} from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { UserRouter } from '@share/router';
import TestAgent from 'supertest/lib/agent';
import { ClientProxy } from '@nestjs/microservices';
import UserService from '../user.service';
import startUp from './pre-setup';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import { sessionPayload, user } from '@share/test/pre-setup/mock/data/user';
import { HTTP_METHOD } from '@share/enums';
import { createDescribeTest, createTestName, getMockModule } from '@share/test/helpers';
import { logoutPattern } from '@share/pattern';
import { createMessage, createMessages } from '@share/utils';
import messages from '@share/constants/messages';
import { PrismaDisconnectError } from '@share/test/pre-setup/mock/errors/prisma-errors';
import UserModule from '../user.module';
const logoutUrl = UserRouter.absolute.logout;
const MockUserModule = getMockModule(UserModule, { path: logoutUrl, method: RequestMethod.GET });

let api: TestAgent;
let clientProxy: ClientProxy;
let close: () => Promise<void>;
let userService: UserService;
const userId = user.user_id;

beforeAll(async () => {
  const requestTest = await startUp(MockUserModule);
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

describe(createDescribeTest(HTTP_METHOD.POST, logoutUrl), () => {
  it(createTestName('logout success', HttpStatus.NO_CONTENT), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(null));
    const loginService = jest.spyOn(userService, 'logout');
    await api.get(logoutUrl).set('mock-session', JSON.stringify(sessionPayload)).expect(HttpStatus.NO_CONTENT);
    expect(loginService).toHaveBeenCalledTimes(1);
    expect(loginService).toHaveBeenCalledWith(userId);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(logoutPattern, userId);
  });

  it(createTestName('logout failed with session unset', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(null));
    const loginService = jest.spyOn(userService, 'logout');
    await api
      .get(logoutUrl)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.ALREADY_LOGOUT));
    expect(loginService).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(createTestName('logout failed with not found error', HttpStatus.NOT_FOUND), async () => {
    expect.hasAssertions();
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new NotFoundException(createMessage(messages.USER.NOT_FOUND))));
    const loginService = jest.spyOn(userService, 'logout');
    await api
      .get(logoutUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .expect(HttpStatus.NOT_FOUND)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.NOT_FOUND));
    expect(loginService).toHaveBeenCalledTimes(1);
    expect(loginService).toHaveBeenCalledWith(userId);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(logoutPattern, userId);
  });

  it(createTestName('logout failed with unknown error', HttpStatus.INTERNAL_SERVER_ERROR), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => UnknownError));
    const loginService = jest.spyOn(userService, 'logout');
    await api
      .get(logoutUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .expect(HttpStatus.INTERNAL_SERVER_ERROR)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(new InternalServerErrorException().message));
    expect(loginService).toHaveBeenCalledTimes(1);
    expect(loginService).toHaveBeenCalledWith(userId);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(logoutPattern, userId);
  });

  it(createTestName('logout failed with rpc unknown error', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new BadRequestException(createMessage(messages.COMMON.COMMON_ERROR))));
    const loginService = jest.spyOn(userService, 'logout');
    await api
      .get(logoutUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.COMMON.COMMON_ERROR));
    expect(loginService).toHaveBeenCalledTimes(1);
    expect(loginService).toHaveBeenCalledWith(userId);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(logoutPattern, userId);
  });

  it(createTestName('logout failed with database disconnect error', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new BadRequestException(PrismaDisconnectError.message)));
    const loginService = jest.spyOn(userService, 'logout');
    await api
      .get(logoutUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.COMMON.DATABASE_DISCONNECT));
    expect(loginService).toHaveBeenCalledTimes(1);
    expect(loginService).toHaveBeenCalledWith(userId);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(logoutPattern, userId);
  });

  it(createTestName('logout failed with server error', HttpStatus.INTERNAL_SERVER_ERROR), async () => {
    expect.hasAssertions();
    const serverError = new InternalServerErrorException();
    const loginService = jest.spyOn(userService, 'logout');
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => serverError));
    await api
      .get(logoutUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .expect(HttpStatus.INTERNAL_SERVER_ERROR)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(serverError.message));
    expect(loginService).toHaveBeenCalledTimes(1);
    expect(loginService).toHaveBeenCalledWith(userId);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(logoutPattern, userId);
  });
});

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
import TestAgent from 'supertest/lib/agent';
import startUp from './pre-setup';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import { PrismaDisconnectError } from '@share/test/pre-setup/mock/errors/prisma-errors';
import { deleteUserPattern } from '@share/pattern';
import { user, apiKey } from '@share/test/pre-setup/mock/data/user';
import { sessionPayload } from '@share/test/pre-setup/mock/data/user';
import { createDescribeTest, createTestName, getMockModule } from '@share/test/helpers';
import UserService from '../user.service';
import UserModule from '../user.module';
import messages from '@share/constants/messages';
import constants from '@share/constants';
import { HTTP_METHOD, POWER_NUMERIC } from '@share/enums';
import { createMessage, createMessages, signApiKey } from '@share/utils';
import { UserRouter } from '@share/router';
const deleteUserBaseUrl: string = UserRouter.absolute.delete;
const userId = user.user_id;
const deleteUserUrl: string = `${deleteUserBaseUrl}/${userId}`;
const MockUserModule = getMockModule(UserModule, { path: `${deleteUserBaseUrl}/*`, method: RequestMethod.DELETE });

let api: TestAgent;
let clientProxy: ClientProxy;
let close: () => Promise<void>;
let userService: UserService;

const invalidPowerSessionPayload = { ...sessionPayload, power: POWER_NUMERIC.SALE };
const missMatchUserIdApiKey = signApiKey({ userId: Date.now().toString(), email: user.email, power: user.power });

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

describe(createDescribeTest(HTTP_METHOD.DELETE, deleteUserBaseUrl), () => {
  it(createTestName('delete user success', HttpStatus.OK), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(user));
    const deleteUserService = jest.spyOn(userService, 'deleteUser');
    await api
      .delete(deleteUserUrl)
      .set('Cookie', [`${constants.IMPACT_USER_API_KEY}=${missMatchUserIdApiKey}`])
      .set('mock-session', JSON.stringify(sessionPayload))
      .expect(HttpStatus.OK)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.DELETE_USER_SUCCESS));
    expect(deleteUserService).toHaveBeenCalledTimes(1);
    expect(deleteUserService).toHaveBeenCalledWith(userId);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(deleteUserPattern, userId);
  });

  it(createTestName('delete user failed with authentication error', HttpStatus.UNAUTHORIZED), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(user));
    const deleteUserService = jest.spyOn(userService, 'deleteUser');
    await api
      .delete(deleteUserUrl)
      .expect(HttpStatus.UNAUTHORIZED)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.DID_NOT_LOGIN));
    expect(deleteUserService).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(createTestName('delete user failed with API key not set', HttpStatus.UNAUTHORIZED), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(user));
    const deleteUserService = jest.spyOn(userService, 'deleteUser');
    await api
      .delete(deleteUserUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .expect(HttpStatus.UNAUTHORIZED)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.API_KEY_INVALID));
    expect(deleteUserService).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(createTestName('delete user failed when update self information', HttpStatus.UNAUTHORIZED), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(user));
    const deleteUserService = jest.spyOn(userService, 'deleteUser');
    await api
      .delete(deleteUserUrl)
      .set('Cookie', [`${constants.IMPACT_USER_API_KEY}=${apiKey}`])
      .set('mock-session', JSON.stringify(sessionPayload))
      .expect(HttpStatus.UNAUTHORIZED)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.DO_NOT_CHANGE_YOURSELF));
    expect(deleteUserService).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(createTestName('delete user failed when user have not permission', HttpStatus.UNAUTHORIZED), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(user));
    const deleteUserService = jest.spyOn(userService, 'deleteUser');
    await api
      .delete(deleteUserUrl)
      .set('Cookie', [`${constants.IMPACT_USER_API_KEY}=${apiKey}`])
      .set('mock-session', JSON.stringify(invalidPowerSessionPayload))
      .expect(HttpStatus.UNAUTHORIZED)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.DO_NOT_PERMISSION));
    expect(deleteUserService).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(createTestName('delete user failed with not found error', HttpStatus.NOT_FOUND), async () => {
    expect.hasAssertions();
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new NotFoundException(createMessage(messages.USER.NOT_FOUND))));
    const deleteUserService = jest.spyOn(userService, 'deleteUser');
    await api
      .delete(deleteUserUrl)
      .set('Cookie', [`${constants.IMPACT_USER_API_KEY}=${missMatchUserIdApiKey}`])
      .set('mock-session', JSON.stringify(sessionPayload))
      .expect(HttpStatus.NOT_FOUND)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.NOT_FOUND));
    expect(deleteUserService).toHaveBeenCalledTimes(1);
    expect(deleteUserService).toHaveBeenCalledWith(userId);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(deleteUserPattern, userId);
  });

  it(createTestName('delete user failed with unknown error', HttpStatus.INTERNAL_SERVER_ERROR), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => UnknownError));
    const deleteUserService = jest.spyOn(userService, 'deleteUser');
    await api
      .delete(deleteUserUrl)
      .set('Cookie', [`${constants.IMPACT_USER_API_KEY}=${missMatchUserIdApiKey}`])
      .set('mock-session', JSON.stringify(sessionPayload))
      .expect(HttpStatus.INTERNAL_SERVER_ERROR)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(new InternalServerErrorException().message));
    expect(deleteUserService).toHaveBeenCalledTimes(1);
    expect(deleteUserService).toHaveBeenCalledWith(userId);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(deleteUserPattern, userId);
  });

  it(createTestName('delete user failed with RPC unknown error', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new BadRequestException(createMessage(messages.COMMON.COMMON_ERROR))));
    const deleteUserService = jest.spyOn(userService, 'deleteUser');
    await api
      .delete(deleteUserUrl)
      .set('Cookie', [`${constants.IMPACT_USER_API_KEY}=${missMatchUserIdApiKey}`])
      .set('mock-session', JSON.stringify(sessionPayload))
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.COMMON.COMMON_ERROR));
    expect(deleteUserService).toHaveBeenCalledTimes(1);
    expect(deleteUserService).toHaveBeenCalledWith(userId);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(deleteUserPattern, userId);
  });

  it(createTestName('delete user failed with server error', HttpStatus.INTERNAL_SERVER_ERROR), async () => {
    expect.hasAssertions();
    const serverError = new InternalServerErrorException();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => serverError));
    const deleteUserService = jest.spyOn(userService, 'deleteUser');
    await api
      .delete(deleteUserUrl)
      .set('Cookie', [`${constants.IMPACT_USER_API_KEY}=${missMatchUserIdApiKey}`])
      .set('mock-session', JSON.stringify(sessionPayload))
      .expect(HttpStatus.INTERNAL_SERVER_ERROR)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(serverError.message));
    expect(deleteUserService).toHaveBeenCalledTimes(1);
    expect(deleteUserService).toHaveBeenCalledWith(userId);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(deleteUserPattern, userId);
  });

  it(createTestName('delete user failed with invalid userId field', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send');
    const deleteUserService = jest.spyOn(userService, 'deleteUser');
    const response = await api
      .delete(`${deleteUserBaseUrl}/zyz`)
      .set('Cookie', [`${constants.IMPACT_USER_API_KEY}=${missMatchUserIdApiKey}`])
      .set('mock-session', JSON.stringify(sessionPayload))
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/);
    expect(response.body).toEqual({ messages: expect.any(Array) });
    expect(deleteUserService).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(createTestName('delete user failed with database disconnect', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new BadRequestException(PrismaDisconnectError.message)));
    const deleteUserService = jest.spyOn(userService, 'deleteUser');
    await api
      .delete(deleteUserUrl)
      .set('Cookie', [`${constants.IMPACT_USER_API_KEY}=${missMatchUserIdApiKey}`])
      .set('mock-session', JSON.stringify(sessionPayload))
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.COMMON.DATABASE_DISCONNECT));
    expect(deleteUserService).toHaveBeenCalledTimes(1);
    expect(deleteUserService).toHaveBeenCalledWith(userId);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(deleteUserPattern, userId);
  });
});

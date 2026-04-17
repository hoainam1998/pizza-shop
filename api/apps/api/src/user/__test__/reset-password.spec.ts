import { BadRequestException, HttpStatus, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { UserRouter } from '@share/router';
import TestAgent from 'supertest/lib/agent';
import { ClientProxy } from '@nestjs/microservices';
import UserService from '../user.service';
import startUp from './pre-setup';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import { HTTP_METHOD, APP_NAME } from '@share/enums';
import { user, resetPasswordToken } from '@share/test/pre-setup/mock/data/user';
import { createDescribeTest, createTestName } from '@share/test/helpers';
import { resetPasswordPattern } from '@share/pattern';
import { createMessage, createMessages, autoGeneratePassword } from '@share/utils';
import messages from '@share/constants/messages';
import { PrismaDisconnectError } from '@share/test/pre-setup/mock/errors/prisma-errors';
const resetPasswordUrl = UserRouter.absolute.resetPassword;

let api: TestAgent;
let clientProxy: ClientProxy;
let close: () => Promise<void>;
let userService: UserService;

const requestBody = {
  password: user.password,
  oldPassword: autoGeneratePassword(),
  email: user.email,
  token: resetPasswordToken,
};

const resetPasswordPayload = {
  ...requestBody,
  by: APP_NAME.ADMIN,
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

describe(createDescribeTest(HTTP_METHOD.POST, resetPasswordUrl), () => {
  it(createTestName('reset password success', HttpStatus.OK), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(user));
    const resetPasswordService = jest.spyOn(userService, 'resetPassword');
    await api
      .post(resetPasswordUrl)
      .set('Cookie', [`app=${APP_NAME.ADMIN}`])
      .send(requestBody)
      .expect(HttpStatus.OK)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.RESET_PASSWORD_SUCCESS));
    expect(resetPasswordService).toHaveBeenCalledTimes(1);
    expect(resetPasswordService).toHaveBeenCalledWith(resetPasswordPayload);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(resetPasswordPattern, resetPasswordPayload);
  });

  it(createTestName('reset password failed with sale view and admin role', HttpStatus.UNAUTHORIZED), async () => {
    expect.hasAssertions();
    const resetPasswordPayloadWithSale = { ...resetPasswordPayload, by: APP_NAME.SALE };
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new UnauthorizedException(createMessage(messages.USER.NOT_ALLOW_ADMIN_LOGIN))));
    const resetPasswordService = jest.spyOn(userService, 'resetPassword');
    await api
      .post(resetPasswordUrl)
      .set('Cookie', [`app=${APP_NAME.SALE}`])
      .send(requestBody)
      .expect(HttpStatus.UNAUTHORIZED)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.NOT_ALLOW_ADMIN_LOGIN));
    expect(resetPasswordService).toHaveBeenCalledTimes(1);
    expect(resetPasswordService).toHaveBeenCalledWith(resetPasswordPayloadWithSale);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(resetPasswordPattern, resetPasswordPayloadWithSale);
  });

  it(createTestName('reset password failed with admin view and sale role', HttpStatus.UNAUTHORIZED), async () => {
    expect.hasAssertions();
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new UnauthorizedException(createMessage(messages.USER.NOT_ALLOW_SALE_LOGIN))));
    const resetPasswordService = jest.spyOn(userService, 'resetPassword');
    await api
      .post(resetPasswordUrl)
      .set('Cookie', [`app=${APP_NAME.ADMIN}`])
      .send(requestBody)
      .expect(HttpStatus.UNAUTHORIZED)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.NOT_ALLOW_SALE_LOGIN));
    expect(resetPasswordService).toHaveBeenCalledTimes(1);
    expect(resetPasswordService).toHaveBeenCalledWith(resetPasswordPayload);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(resetPasswordPattern, resetPasswordPayload);
  });

  it(createTestName('reset password failed with when unknown resource', HttpStatus.UNAUTHORIZED), async () => {
    expect.hasAssertions();
    const requestBodyWithUnknownResource = { ...requestBody, by: undefined };
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new UnauthorizedException(createMessage(messages.COMMON.UNKNOWN_RESOURCE))));
    const resetPasswordService = jest.spyOn(userService, 'resetPassword');
    await api
      .post(resetPasswordUrl)
      .send(requestBodyWithUnknownResource)
      .expect(HttpStatus.UNAUTHORIZED)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.COMMON.UNKNOWN_RESOURCE));
    expect(resetPasswordService).toHaveBeenCalledTimes(1);
    expect(resetPasswordService).toHaveBeenCalledWith(requestBodyWithUnknownResource);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(resetPasswordPattern, requestBodyWithUnknownResource);
  });

  it(createTestName('reset password failed with not found error', HttpStatus.UNAUTHORIZED), async () => {
    expect.hasAssertions();
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new UnauthorizedException(createMessage(messages.USER.NOT_FOUND))));
    const resetPasswordService = jest.spyOn(userService, 'resetPassword');
    await api
      .post(resetPasswordUrl)
      .set('Cookie', [`app=${APP_NAME.ADMIN}`])
      .send(requestBody)
      .expect(HttpStatus.UNAUTHORIZED)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.NOT_FOUND));
    expect(resetPasswordService).toHaveBeenCalledTimes(1);
    expect(resetPasswordService).toHaveBeenCalledWith(resetPasswordPayload);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(resetPasswordPattern, resetPasswordPayload);
  });

  it(createTestName('reset password failed with password not match error', HttpStatus.UNAUTHORIZED), async () => {
    expect.hasAssertions();
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new UnauthorizedException(createMessage(messages.USER.PASSWORD_NOT_MATCH))));
    const resetPasswordService = jest.spyOn(userService, 'resetPassword');
    await api
      .post(resetPasswordUrl)
      .set('Cookie', [`app=${APP_NAME.ADMIN}`])
      .send(requestBody)
      .expect(HttpStatus.UNAUTHORIZED)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.PASSWORD_NOT_MATCH));
    expect(resetPasswordService).toHaveBeenCalledTimes(1);
    expect(resetPasswordService).toHaveBeenCalledWith(resetPasswordPayload);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(resetPasswordPattern, resetPasswordPayload);
  });

  it(createTestName('reset password failed with rpc unknown error', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new BadRequestException(createMessage(messages.COMMON.COMMON_ERROR))));
    const resetPasswordService = jest.spyOn(userService, 'resetPassword');
    await api
      .post(resetPasswordUrl)
      .set('Cookie', [`app=${APP_NAME.ADMIN}`])
      .send(requestBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.COMMON.COMMON_ERROR));
    expect(resetPasswordService).toHaveBeenCalledTimes(1);
    expect(resetPasswordService).toHaveBeenCalledWith(resetPasswordPayload);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(resetPasswordPattern, resetPasswordPayload);
  });

  it(createTestName('reset password failed with unknown error', HttpStatus.INTERNAL_SERVER_ERROR), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => UnknownError));
    const resetPasswordService = jest.spyOn(userService, 'resetPassword');
    await api
      .post(resetPasswordUrl)
      .set('Cookie', [`app=${APP_NAME.ADMIN}`])
      .send(requestBody)
      .expect(HttpStatus.INTERNAL_SERVER_ERROR)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(new InternalServerErrorException().message));
    expect(resetPasswordService).toHaveBeenCalledTimes(1);
    expect(resetPasswordService).toHaveBeenCalledWith(resetPasswordPayload);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(resetPasswordPattern, resetPasswordPayload);
  });

  it(createTestName('reset password failed with database disconnect error', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new BadRequestException(PrismaDisconnectError.message)));
    const resetPasswordService = jest.spyOn(userService, 'resetPassword');
    await api
      .post(resetPasswordUrl)
      .set('Cookie', [`app=${APP_NAME.ADMIN}`])
      .send(requestBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.COMMON.DATABASE_DISCONNECT));
    expect(resetPasswordService).toHaveBeenCalledTimes(1);
    expect(resetPasswordService).toHaveBeenCalledWith(resetPasswordPayload);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(resetPasswordPattern, resetPasswordPayload);
  });
});

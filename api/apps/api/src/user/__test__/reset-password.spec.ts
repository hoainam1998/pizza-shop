import { BadRequestException, HttpStatus, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { UserRouter } from '@share/router';
import TestAgent from 'supertest/lib/agent';
import { ClientProxy } from '@nestjs/microservices';
import UserModule from '../user.module';
import UserService from '../user.service';
import startUp from './pre-setup';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import { HTTP_METHOD } from '@share/enums';
import { user } from '@share/test/pre-setup/mock/data/user';
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
  token: user.reset_password_token,
};

beforeEach(async () => {
  const requestTest = await startUp(UserModule);
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
      .send(requestBody)
      .expect(HttpStatus.OK)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.RESET_PASSWORD_SUCCESS));
    expect(resetPasswordService).toHaveBeenCalledTimes(1);
    expect(resetPasswordService).toHaveBeenCalledWith(requestBody);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(resetPasswordPattern, requestBody);
  });

  it(createTestName('reset password failed with not found error', HttpStatus.UNAUTHORIZED), async () => {
    expect.hasAssertions();
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new UnauthorizedException(createMessage(messages.USER.NOT_FOUND))));
    const resetPasswordService = jest.spyOn(userService, 'resetPassword');
    await api
      .post(resetPasswordUrl)
      .send(requestBody)
      .expect(HttpStatus.UNAUTHORIZED)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.NOT_FOUND));
    expect(resetPasswordService).toHaveBeenCalledTimes(1);
    expect(resetPasswordService).toHaveBeenCalledWith(requestBody);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(resetPasswordPattern, requestBody);
  });

  it(createTestName('reset password failed with password not match error', HttpStatus.UNAUTHORIZED), async () => {
    expect.hasAssertions();
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new UnauthorizedException(createMessage(messages.USER.PASSWORD_NOT_MATCH))));
    const resetPasswordService = jest.spyOn(userService, 'resetPassword');
    await api
      .post(resetPasswordUrl)
      .send(requestBody)
      .expect(HttpStatus.UNAUTHORIZED)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.PASSWORD_NOT_MATCH));
    expect(resetPasswordService).toHaveBeenCalledTimes(1);
    expect(resetPasswordService).toHaveBeenCalledWith(requestBody);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(resetPasswordPattern, requestBody);
  });

  it(createTestName('reset password failed with rpc unknown error', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new BadRequestException(createMessage(messages.COMMON.COMMON_ERROR))));
    const resetPasswordService = jest.spyOn(userService, 'resetPassword');
    await api
      .post(resetPasswordUrl)
      .send(requestBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.COMMON.COMMON_ERROR));
    expect(resetPasswordService).toHaveBeenCalledTimes(1);
    expect(resetPasswordService).toHaveBeenCalledWith(requestBody);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(resetPasswordPattern, requestBody);
  });

  it(createTestName('reset password failed with unknown error', HttpStatus.INTERNAL_SERVER_ERROR), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => UnknownError));
    const resetPasswordService = jest.spyOn(userService, 'resetPassword');
    await api
      .post(resetPasswordUrl)
      .send(requestBody)
      .expect(HttpStatus.INTERNAL_SERVER_ERROR)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(new InternalServerErrorException().message));
    expect(resetPasswordService).toHaveBeenCalledTimes(1);
    expect(resetPasswordService).toHaveBeenCalledWith(requestBody);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(resetPasswordPattern, requestBody);
  });

  it(createTestName('reset password failed with database disconnect error', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new BadRequestException(PrismaDisconnectError.message)));
    const resetPasswordService = jest.spyOn(userService, 'resetPassword');
    await api
      .post(resetPasswordUrl)
      .send(requestBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.COMMON.DATABASE_DISCONNECT));
    expect(resetPasswordService).toHaveBeenCalledTimes(1);
    expect(resetPasswordService).toHaveBeenCalledWith(requestBody);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(resetPasswordPattern, requestBody);
  });

  it(createTestName('reset password failed with sex invalid', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const resetPasswordService = jest.spyOn(userService, 'resetPassword');
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new BadRequestException(createMessage(messages.USER.YOUR_GENDER_INVALID))));
    await api
      .post(resetPasswordUrl)
      .send(requestBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.YOUR_GENDER_INVALID));
    expect(resetPasswordService).toHaveBeenCalledTimes(1);
    expect(resetPasswordService).toHaveBeenCalledWith(requestBody);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(resetPasswordPattern, requestBody);
  });

  it(createTestName('reset password failed with power invalid', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const resetPasswordService = jest.spyOn(userService, 'resetPassword');
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new BadRequestException(createMessage(messages.USER.YOUR_POWER_INVALID))));
    await api
      .post(resetPasswordUrl)
      .send(requestBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.YOUR_POWER_INVALID));
    expect(resetPasswordService).toHaveBeenCalledTimes(1);
    expect(resetPasswordService).toHaveBeenCalledWith(requestBody);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(resetPasswordPattern, requestBody);
  });

  it(createTestName('reset password failed with email was already exist', HttpStatus.UNAUTHORIZED), async () => {
    expect.hasAssertions();
    const resetPasswordService = jest.spyOn(userService, 'resetPassword');
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(
        throwError(() => new UnauthorizedException(createMessage(messages.USER.EMAIL_REGIS_ALREADY_EXIST))),
      );
    await api
      .post(resetPasswordUrl)
      .set('mock-session', JSON.stringify({ canSignup: true }))
      .send(requestBody)
      .expect(HttpStatus.UNAUTHORIZED)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.EMAIL_REGIS_ALREADY_EXIST));
    expect(resetPasswordService).toHaveBeenCalledTimes(1);
    expect(resetPasswordService).toHaveBeenCalledWith(requestBody);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(resetPasswordPattern, requestBody);
  });

  it(createTestName('reset password failed with phone was already exist', HttpStatus.UNAUTHORIZED), async () => {
    expect.hasAssertions();
    const resetPasswordService = jest.spyOn(userService, 'resetPassword');
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new UnauthorizedException(createMessage(messages.USER.PHONE_ALREADY_EXIST))));
    await api
      .post(resetPasswordUrl)
      .set('mock-session', JSON.stringify({ canSignup: true }))
      .send(requestBody)
      .expect(HttpStatus.UNAUTHORIZED)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.PHONE_ALREADY_EXIST));
    expect(resetPasswordService).toHaveBeenCalledTimes(1);
    expect(resetPasswordService).toHaveBeenCalledWith(requestBody);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(resetPasswordPattern, requestBody);
  });
});

import { BadRequestException, HttpStatus, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { UserRouter } from '@share/router';
import TestAgent from 'supertest/lib/agent';
import { ClientProxy } from '@nestjs/microservices';
import UserService from '../user.service';
import startUp from './pre-setup';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import { HTTP_METHOD, APP_NAME } from '@share/enums';
import { user } from '@share/test/pre-setup/mock/data/user';
import { createDescribeTest, createTestName } from '@share/test/helpers';
import { refreshResetPasswordTokenPattern } from '@share/pattern';
import {
  createMessage,
  createMessages,
  autoGeneratePassword,
  signingAdminResetPasswordToken,
  getResetPasswordLink,
} from '@share/utils';
import messages from '@share/constants/messages';
import { PrismaDisconnectError } from '@share/test/pre-setup/mock/errors/prisma-errors';
import SendEmailService from '@share/libs/mailer/mailer.service';
const refreshResetPasswordTokenUrl = UserRouter.absolute.refreshResetPasswordToken;

let api: TestAgent;
let clientProxy: ClientProxy;
let close: () => Promise<void>;
let userService: UserService;
let sendEmailService: SendEmailService;

const originPassword = autoGeneratePassword();
const resetPasswordToken = signingAdminResetPasswordToken({ email: user.email, password: originPassword });
const resetPasswordLink = getResetPasswordLink(resetPasswordToken, user.power);
const response = { password: originPassword, email: user.email, reset_password_link: resetPasswordLink };

beforeAll(async () => {
  const requestTest = await startUp();
  api = requestTest.api;
  clientProxy = requestTest.clientProxy;
  close = () => requestTest.app.close();
  userService = requestTest.app.get(UserService);
  sendEmailService = requestTest.app.get(SendEmailService);
});

const tokenPayload = {
  token: resetPasswordToken,
};

afterEach(async () => {
  if (close) {
    await close();
  }
});

describe(createDescribeTest(HTTP_METHOD.POST, refreshResetPasswordTokenUrl), () => {
  it(createTestName('refresh reset password token success', HttpStatus.CREATED), async () => {
    expect.hasAssertions();
    const refreshResetPasswordBody = {
      ...tokenPayload,
      by: APP_NAME.ADMIN,
    };
    const sendEmail = jest.spyOn(sendEmailService, 'sendPassword').mockImplementation(jest.fn());
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(response));
    const refreshResetPasswordTokenService = jest.spyOn(userService, 'refreshResetPasswordToken');
    await api
      .post(refreshResetPasswordTokenUrl)
      .set('Cookie', [`app=${APP_NAME.ADMIN}`])
      .send(tokenPayload)
      .expect(HttpStatus.CREATED)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.REFRESH_RESET_PASSWORD_TOKEN_SUCCESS));
    expect(refreshResetPasswordTokenService).toHaveBeenCalledTimes(1);
    expect(refreshResetPasswordTokenService).toHaveBeenCalledWith(refreshResetPasswordBody);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(refreshResetPasswordTokenPattern, refreshResetPasswordBody);
    expect(sendEmail).toHaveBeenCalledTimes(1);
    expect(sendEmail).toHaveBeenCalledWith(response.email, response.reset_password_link, response.password);
  });

  it(
    createTestName('refresh reset password token failed with sale view and admin role', HttpStatus.UNAUTHORIZED),
    async () => {
      expect.hasAssertions();
      const refreshResetPasswordBodyWithSale = {
        ...tokenPayload,
        by: APP_NAME.SALE,
      };
      const sendEmail = jest.spyOn(sendEmailService, 'sendPassword').mockImplementation(jest.fn());
      const send = jest
        .spyOn(clientProxy, 'send')
        .mockReturnValue(
          throwError(() => new UnauthorizedException(createMessage(messages.USER.NOT_ALLOW_ADMIN_LOGIN))),
        );
      const refreshResetPasswordTokenService = jest.spyOn(userService, 'refreshResetPasswordToken');
      await api
        .post(refreshResetPasswordTokenUrl)
        .set('Cookie', [`app=${APP_NAME.SALE}`])
        .send(tokenPayload)
        .expect(HttpStatus.UNAUTHORIZED)
        .expect('Content-Type', /application\/json/)
        .expect(createMessages(messages.USER.NOT_ALLOW_ADMIN_LOGIN));
      expect(refreshResetPasswordTokenService).toHaveBeenCalledTimes(1);
      expect(refreshResetPasswordTokenService).toHaveBeenCalledWith(refreshResetPasswordBodyWithSale);
      expect(send).toHaveBeenCalledTimes(1);
      expect(send).toHaveBeenCalledWith(refreshResetPasswordTokenPattern, refreshResetPasswordBodyWithSale);
      expect(sendEmail).not.toHaveBeenCalled();
    },
  );

  it(
    createTestName('refresh reset password token failed with admin view and sale role', HttpStatus.UNAUTHORIZED),
    async () => {
      expect.hasAssertions();
      const refreshResetPasswordBodyWithAdmin = {
        ...tokenPayload,
        by: APP_NAME.ADMIN,
      };
      const sendEmail = jest.spyOn(sendEmailService, 'sendPassword').mockImplementation(jest.fn());
      const send = jest
        .spyOn(clientProxy, 'send')
        .mockReturnValue(
          throwError(() => new UnauthorizedException(createMessage(messages.USER.NOT_ALLOW_SALE_LOGIN))),
        );
      const refreshResetPasswordTokenService = jest.spyOn(userService, 'refreshResetPasswordToken');
      await api
        .post(refreshResetPasswordTokenUrl)
        .set('Cookie', [`app=${APP_NAME.ADMIN}`])
        .send(tokenPayload)
        .expect(HttpStatus.UNAUTHORIZED)
        .expect('Content-Type', /application\/json/)
        .expect(createMessages(messages.USER.NOT_ALLOW_SALE_LOGIN));
      expect(refreshResetPasswordTokenService).toHaveBeenCalledTimes(1);
      expect(refreshResetPasswordTokenService).toHaveBeenCalledWith(refreshResetPasswordBodyWithAdmin);
      expect(send).toHaveBeenCalledTimes(1);
      expect(send).toHaveBeenCalledWith(refreshResetPasswordTokenPattern, refreshResetPasswordBodyWithAdmin);
      expect(sendEmail).not.toHaveBeenCalled();
    },
  );

  it(createTestName('refresh reset password token failed with unknown resource', HttpStatus.UNAUTHORIZED), async () => {
    expect.hasAssertions();
    const refreshResetPasswordBodyWithUnknownResource = {
      ...tokenPayload,
      by: undefined,
    };
    const sendEmail = jest.spyOn(sendEmailService, 'sendPassword').mockImplementation(jest.fn());
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new UnauthorizedException(createMessage(messages.COMMON.UNKNOWN_RESOURCE))));
    const refreshResetPasswordTokenService = jest.spyOn(userService, 'refreshResetPasswordToken');
    await api
      .post(refreshResetPasswordTokenUrl)
      .send(tokenPayload)
      .expect(HttpStatus.UNAUTHORIZED)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.COMMON.UNKNOWN_RESOURCE));
    expect(refreshResetPasswordTokenService).toHaveBeenCalledTimes(1);
    expect(refreshResetPasswordTokenService).toHaveBeenCalledWith(refreshResetPasswordBodyWithUnknownResource);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(refreshResetPasswordTokenPattern, refreshResetPasswordBodyWithUnknownResource);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it(createTestName('refresh reset password token failed with not found error', HttpStatus.UNAUTHORIZED), async () => {
    expect.hasAssertions();
    const refreshResetPasswordBody = {
      ...tokenPayload,
      by: APP_NAME.ADMIN,
    };
    const sendEmail = jest.spyOn(sendEmailService, 'sendPassword').mockImplementation(jest.fn());
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new UnauthorizedException(createMessage(messages.USER.NOT_FOUND))));
    const refreshResetPasswordTokenService = jest.spyOn(userService, 'refreshResetPasswordToken');
    await api
      .post(refreshResetPasswordTokenUrl)
      .set('Cookie', [`app=${APP_NAME.ADMIN}`])
      .send(tokenPayload)
      .expect(HttpStatus.UNAUTHORIZED)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.NOT_FOUND));
    expect(refreshResetPasswordTokenService).toHaveBeenCalledTimes(1);
    expect(refreshResetPasswordTokenService).toHaveBeenCalledWith(refreshResetPasswordBody);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(refreshResetPasswordTokenPattern, refreshResetPasswordBody);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it(
    createTestName('refresh reset password token failed with user were blocked', HttpStatus.UNAUTHORIZED),
    async () => {
      expect.hasAssertions();
      const refreshResetPasswordBody = {
        ...tokenPayload,
        by: APP_NAME.ADMIN,
      };
      const sendEmail = jest.spyOn(sendEmailService, 'sendPassword').mockImplementation(jest.fn());
      const send = jest
        .spyOn(clientProxy, 'send')
        .mockReturnValue(throwError(() => new UnauthorizedException(createMessage(messages.USER.YOU_WERE_BLOCKED))));
      const refreshResetPasswordTokenService = jest.spyOn(userService, 'refreshResetPasswordToken');
      await api
        .post(refreshResetPasswordTokenUrl)
        .set('Cookie', [`app=${APP_NAME.ADMIN}`])
        .send(tokenPayload)
        .expect(HttpStatus.UNAUTHORIZED)
        .expect('Content-Type', /application\/json/)
        .expect(createMessages(messages.USER.YOU_WERE_BLOCKED));
      expect(refreshResetPasswordTokenService).toHaveBeenCalledTimes(1);
      expect(refreshResetPasswordTokenService).toHaveBeenCalledWith(refreshResetPasswordBody);
      expect(send).toHaveBeenCalledTimes(1);
      expect(send).toHaveBeenCalledWith(refreshResetPasswordTokenPattern, refreshResetPasswordBody);
      expect(sendEmail).not.toHaveBeenCalled();
    },
  );

  it(createTestName('refresh reset password token failed with rpc unknown error', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const refreshResetPasswordBody = {
      ...tokenPayload,
      by: APP_NAME.ADMIN,
    };
    const sendEmail = jest.spyOn(sendEmailService, 'sendPassword').mockImplementation(jest.fn());
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new BadRequestException(createMessage(messages.COMMON.COMMON_ERROR))));
    const refreshResetPasswordTokenService = jest.spyOn(userService, 'refreshResetPasswordToken');
    await api
      .post(refreshResetPasswordTokenUrl)
      .set('Cookie', [`app=${APP_NAME.ADMIN}`])
      .send(tokenPayload)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.COMMON.COMMON_ERROR));
    expect(refreshResetPasswordTokenService).toHaveBeenCalledTimes(1);
    expect(refreshResetPasswordTokenService).toHaveBeenCalledWith(refreshResetPasswordBody);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(refreshResetPasswordTokenPattern, refreshResetPasswordBody);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it(
    createTestName('refresh reset password token failed with unknown error', HttpStatus.INTERNAL_SERVER_ERROR),
    async () => {
      expect.hasAssertions();
      const refreshResetPasswordBody = {
        ...tokenPayload,
        by: APP_NAME.ADMIN,
      };
      const sendEmail = jest.spyOn(sendEmailService, 'sendPassword').mockImplementation(jest.fn());
      const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => UnknownError));
      const refreshResetPasswordTokenService = jest.spyOn(userService, 'refreshResetPasswordToken');
      await api
        .post(refreshResetPasswordTokenUrl)
        .set('Cookie', [`app=${APP_NAME.ADMIN}`])
        .send(tokenPayload)
        .expect(HttpStatus.INTERNAL_SERVER_ERROR)
        .expect('Content-Type', /application\/json/)
        .expect(createMessages(new InternalServerErrorException().message));
      expect(refreshResetPasswordTokenService).toHaveBeenCalledTimes(1);
      expect(refreshResetPasswordTokenService).toHaveBeenCalledWith(refreshResetPasswordBody);
      expect(send).toHaveBeenCalledTimes(1);
      expect(send).toHaveBeenCalledWith(refreshResetPasswordTokenPattern, refreshResetPasswordBody);
      expect(sendEmail).not.toHaveBeenCalled();
    },
  );

  it(
    createTestName('refresh reset password token failed with unknown error', HttpStatus.INTERNAL_SERVER_ERROR),
    async () => {
      expect.hasAssertions();
      const refreshResetPasswordBody = {
        ...tokenPayload,
        by: APP_NAME.ADMIN,
      };
      const sendEmail = jest.spyOn(sendEmailService, 'sendPassword').mockImplementation(jest.fn());
      const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => UnknownError));
      const refreshResetPasswordTokenService = jest.spyOn(userService, 'refreshResetPasswordToken');
      await api
        .post(refreshResetPasswordTokenUrl)
        .set('Cookie', [`app=${APP_NAME.ADMIN}`])
        .send(tokenPayload)
        .expect(HttpStatus.INTERNAL_SERVER_ERROR)
        .expect('Content-Type', /application\/json/)
        .expect(createMessages(new InternalServerErrorException().message));
      expect(refreshResetPasswordTokenService).toHaveBeenCalledTimes(1);
      expect(refreshResetPasswordTokenService).toHaveBeenCalledWith(refreshResetPasswordBody);
      expect(send).toHaveBeenCalledTimes(1);
      expect(send).toHaveBeenCalledWith(refreshResetPasswordTokenPattern, refreshResetPasswordBody);
      expect(sendEmail).not.toHaveBeenCalled();
    },
  );

  it(
    createTestName('refresh reset password token failed with database disconnect error', HttpStatus.BAD_REQUEST),
    async () => {
      expect.hasAssertions();
      const refreshResetPasswordBody = {
        ...tokenPayload,
        by: APP_NAME.ADMIN,
      };
      const sendEmail = jest.spyOn(sendEmailService, 'sendPassword').mockImplementation(jest.fn());
      const send = jest
        .spyOn(clientProxy, 'send')
        .mockReturnValue(throwError(() => new BadRequestException(PrismaDisconnectError.message)));
      const refreshResetPasswordTokenService = jest.spyOn(userService, 'refreshResetPasswordToken');
      await api
        .post(refreshResetPasswordTokenUrl)
        .set('Cookie', [`app=${APP_NAME.ADMIN}`])
        .send(tokenPayload)
        .expect(HttpStatus.BAD_REQUEST)
        .expect('Content-Type', /application\/json/)
        .expect(createMessages(messages.COMMON.DATABASE_DISCONNECT));
      expect(refreshResetPasswordTokenService).toHaveBeenCalledTimes(1);
      expect(refreshResetPasswordTokenService).toHaveBeenCalledWith(refreshResetPasswordBody);
      expect(send).toHaveBeenCalledTimes(1);
      expect(send).toHaveBeenCalledWith(refreshResetPasswordTokenPattern, refreshResetPasswordBody);
      expect(sendEmail).not.toHaveBeenCalled();
    },
  );
});

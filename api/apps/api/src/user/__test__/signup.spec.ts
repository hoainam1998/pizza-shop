import {
  BadRequestException,
  HttpStatus,
  InternalServerErrorException,
  MiddlewareConsumer,
  RequestMethod,
  UnauthorizedException,
} from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { UserRouter } from '@share/router';
import TestAgent from 'supertest/lib/agent';
import { ClientProxy } from '@nestjs/microservices';
import UserModule from '../user.module';
import UserService from '../user.service';
import startUp from './pre-setup';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import { HTTP_METHOD } from '@share/enums';
import { user } from '@share/test/pre-setup/mock/data/user';
import { createDescribeTest, createTestName, createMessagesTesting } from '@share/test/helpers';
import { signupPattern } from '@share/pattern';
import { createMessage, createMessages, getAdminResetPasswordLink } from '@share/utils';
import messages from '@share/constants/messages';
import { PrismaDisconnectError } from '@share/test/pre-setup/mock/errors/prisma-errors';
import { SignupDTO } from '@share/dto/validators/user.dto';
import SendEmailService from '@share/libs/mailer/mailer.service';
import { signupSession } from '@share/middleware';
import ErrorCode from '@share/error-code';
const signupUrl = UserRouter.absolute.signup;

class MockUserModule extends UserModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(signupSession).forRoutes({ path: 'user/signup', method: RequestMethod.POST });
  }
}

let api: TestAgent;
let clientProxy: ClientProxy;
let close: () => Promise<void>;
let userService: UserService;
let sendEmailService: SendEmailService;
const requestBody = {
  firstName: user.first_name,
  lastName: user.last_name,
  email: user.email,
  phone: user.phone,
  sex: user.sex,
};
const signupUser = instanceToPlain(plainToInstance(SignupDTO, requestBody));
beforeEach(async () => {
  const requestTest = await startUp(MockUserModule);
  api = requestTest.api;
  clientProxy = requestTest.clientProxy;
  close = () => requestTest.app.close();
  userService = requestTest.app.get(UserService);
  sendEmailService = requestTest.app.get(SendEmailService);
});

afterEach(async () => {
  if (close) {
    await close();
  }
});

describe(createDescribeTest(HTTP_METHOD.POST, signupUrl), () => {
  it(createTestName('signup success', HttpStatus.OK), async () => {
    expect.hasAssertions();
    const link = getAdminResetPasswordLink(user.reset_password_token!);
    const sendPassword = jest.spyOn(sendEmailService, 'sendPassword').mockResolvedValue({});
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(user));
    const signupService = jest.spyOn(userService, 'signup');
    await api
      .post(signupUrl)
      .set('mock-session', JSON.stringify({ canSignup: true }))
      .send(requestBody)
      .expect(HttpStatus.CREATED)
      .expect('Content-Type', /application\/json/)
      .expect({
        messages: [messages.USER.SIGNUP_SUCCESS],
      });
    expect(signupService).toHaveBeenCalledTimes(1);
    expect(signupService).toHaveBeenCalledWith(signupUser);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(signupPattern, signupUser);
    expect(sendPassword).toHaveBeenCalledTimes(1);
    expect(sendPassword).toHaveBeenCalledWith(user.email, link, user.plain_password);
  });

  it(createTestName('signup failed with canSignup flag is false', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const sendPassword = jest.spyOn(sendEmailService, 'sendPassword');
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(user));
    const signupService = jest.spyOn(userService, 'signup');
    await api
      .post(signupUrl)
      .send(requestBody)
      .set('mock-session', JSON.stringify({ canSignup: false }))
      .expect(HttpStatus.UNAUTHORIZED)
      .expect('Content-Type', /application\/json/)
      .expect(createMessagesTesting(messages.USER.CAN_NOT_SIGNUP, ErrorCode.CAN_NOT_SIGNUP));
    expect(signupService).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
    expect(sendPassword).not.toHaveBeenCalled();
  });

  it(createTestName('signup failed with rpc unknown error', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const sendPassword = jest.spyOn(sendEmailService, 'sendPassword');
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new BadRequestException(createMessage(messages.COMMON.COMMON_ERROR))));
    const signupService = jest.spyOn(userService, 'signup');
    await api
      .post(signupUrl)
      .set('mock-session', JSON.stringify({ canSignup: true }))
      .send(requestBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.COMMON.COMMON_ERROR));
    expect(signupService).toHaveBeenCalledTimes(1);
    expect(signupService).toHaveBeenCalledWith(signupUser);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(signupPattern, signupUser);
    expect(sendPassword).not.toHaveBeenCalled();
  });

  it(createTestName('signup failed with unknown error', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const sendPassword = jest.spyOn(sendEmailService, 'sendPassword');
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => UnknownError));
    const signupService = jest.spyOn(userService, 'signup');
    await api
      .post(signupUrl)
      .set('mock-session', JSON.stringify({ canSignup: true }))
      .send(requestBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(UnknownError.message));
    expect(signupService).toHaveBeenCalledTimes(1);
    expect(signupService).toHaveBeenCalledWith(signupUser);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(signupPattern, signupUser);
    expect(sendPassword).not.toHaveBeenCalled();
  });

  it(createTestName('signup failed when sendPassword failed', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const link = getAdminResetPasswordLink(user.reset_password_token!);
    const sendPassword = jest.spyOn(sendEmailService, 'sendPassword').mockRejectedValue(UnknownError);
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(user));
    const signupService = jest.spyOn(userService, 'signup');
    await api
      .post(signupUrl)
      .set('mock-session', JSON.stringify({ canSignup: true }))
      .send(requestBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.SIGNUP_FAILED));
    expect(signupService).toHaveBeenCalledTimes(1);
    expect(signupService).toHaveBeenCalledWith(signupUser);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(signupPattern, signupUser);
    expect(sendPassword).toHaveBeenCalledTimes(1);
    expect(sendPassword).toHaveBeenCalledWith(user.email, link, user.plain_password);
  });

  it(createTestName('signup failed with database disconnect error', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const sendPassword = jest.spyOn(sendEmailService, 'sendPassword');
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new BadRequestException(PrismaDisconnectError.message)));
    const signupService = jest.spyOn(userService, 'signup');
    await api
      .post(signupUrl)
      .set('mock-session', JSON.stringify({ canSignup: true }))
      .send(requestBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.COMMON.DATABASE_DISCONNECT));
    expect(signupService).toHaveBeenCalledTimes(1);
    expect(signupService).toHaveBeenCalledWith(signupUser);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(signupPattern, signupUser);
    expect(sendPassword).not.toHaveBeenCalled();
  });

  it(createTestName('signup failed with server error', HttpStatus.INTERNAL_SERVER_ERROR), async () => {
    expect.hasAssertions();
    const sendPassword = jest.spyOn(sendEmailService, 'sendPassword');
    const serverError = new InternalServerErrorException();
    const signupService = jest.spyOn(userService, 'signup');
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => serverError));
    await api
      .post(signupUrl)
      .set('mock-session', JSON.stringify({ canSignup: true }))
      .send(requestBody)
      .expect(HttpStatus.INTERNAL_SERVER_ERROR)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(serverError.message));
    expect(signupService).toHaveBeenCalledTimes(1);
    expect(signupService).toHaveBeenCalledWith(signupUser);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(signupPattern, signupUser);
    expect(sendPassword).not.toHaveBeenCalled();
  });

  it(createTestName('signup failed with sex invalid', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const sendPassword = jest.spyOn(sendEmailService, 'sendPassword');
    const signupService = jest.spyOn(userService, 'signup');
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new BadRequestException(createMessage(messages.USER.YOUR_GENDER_INVALID))));
    await api
      .post(signupUrl)
      .set('mock-session', JSON.stringify({ canSignup: true }))
      .send(requestBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.YOUR_GENDER_INVALID));
    expect(signupService).toHaveBeenCalledTimes(1);
    expect(signupService).toHaveBeenCalledWith(signupUser);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(signupPattern, signupUser);
    expect(sendPassword).not.toHaveBeenCalled();
  });

  it(createTestName('signup failed with power invalid', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const sendPassword = jest.spyOn(sendEmailService, 'sendPassword');
    const signupService = jest.spyOn(userService, 'signup');
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new BadRequestException(createMessage(messages.USER.YOUR_POWER_INVALID))));
    await api
      .post(signupUrl)
      .set('mock-session', JSON.stringify({ canSignup: true }))
      .send(requestBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.YOUR_POWER_INVALID));
    expect(signupService).toHaveBeenCalledTimes(1);
    expect(signupService).toHaveBeenCalledWith(signupUser);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(signupPattern, signupUser);
    expect(sendPassword).not.toHaveBeenCalled();
  });

  it(createTestName('signup failed with email was already exist', HttpStatus.UNAUTHORIZED), async () => {
    expect.hasAssertions();
    const sendPassword = jest.spyOn(sendEmailService, 'sendPassword');
    const signupService = jest.spyOn(userService, 'signup');
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(
        throwError(() => new UnauthorizedException(createMessage(messages.USER.EMAIL_REGIS_ALREADY_EXIST))),
      );
    await api
      .post(signupUrl)
      .set('mock-session', JSON.stringify({ canSignup: true }))
      .send(requestBody)
      .expect(HttpStatus.UNAUTHORIZED)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.EMAIL_REGIS_ALREADY_EXIST));
    expect(signupService).toHaveBeenCalledTimes(1);
    expect(signupService).toHaveBeenCalledWith(signupUser);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(signupPattern, signupUser);
    expect(sendPassword).not.toHaveBeenCalled();
  });

  it(createTestName('signup failed with phone was already exist', HttpStatus.UNAUTHORIZED), async () => {
    expect.hasAssertions();
    const sendPassword = jest.spyOn(sendEmailService, 'sendPassword');
    const signupService = jest.spyOn(userService, 'signup');
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new UnauthorizedException(createMessage(messages.USER.PHONE_ALREADY_EXIST))));
    await api
      .post(signupUrl)
      .set('mock-session', JSON.stringify({ canSignup: true }))
      .send(requestBody)
      .expect(HttpStatus.UNAUTHORIZED)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.PHONE_ALREADY_EXIST));
    expect(signupService).toHaveBeenCalledTimes(1);
    expect(signupService).toHaveBeenCalledWith(signupUser);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(signupPattern, signupUser);
    expect(sendPassword).not.toHaveBeenCalled();
  });
});

import {
  BadRequestException,
  HttpStatus,
  InternalServerErrorException,
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
import { HTTP_METHOD, POWER_NUMERIC } from '@share/enums';
import { user, sessionPayload } from '@share/test/pre-setup/mock/data/user';
import { createDescribeTest, createTestName, getMockModule } from '@share/test/helpers';
import { createMessage, createMessages } from '@share/utils';
import messages from '@share/constants/messages';
import { PrismaDisconnectError } from '@share/test/pre-setup/mock/errors/prisma-errors';
import { CreateUser } from '@share/dto/validators/user.dto';
import SendEmailService from '@share/libs/mailer/mailer.service';
import { signupPattern } from '@share/pattern';
const createUserUrl = UserRouter.absolute.create;

const MockUserModule = getMockModule(UserModule, { path: createUserUrl, method: RequestMethod.POST });

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
  power: POWER_NUMERIC.ADMIN,
};
const userCreate = instanceToPlain(plainToInstance(CreateUser, requestBody));

beforeAll(async () => {
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

describe(createDescribeTest(HTTP_METHOD.POST, createUserUrl), () => {
  it(createTestName('create user success', HttpStatus.OK), async () => {
    expect.hasAssertions();
    const sendPassword = jest.spyOn(sendEmailService, 'sendPassword').mockResolvedValue({});
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(user));
    const createUserService = jest.spyOn(userService, 'signup');
    await api
      .post(createUserUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(requestBody)
      .expect(HttpStatus.CREATED)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.CREATE_USER_SUCCESS));
    expect(createUserService).toHaveBeenCalledTimes(1);
    expect(createUserService).toHaveBeenCalledWith(userCreate);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(signupPattern, userCreate);
    expect(sendPassword).toHaveBeenCalledTimes(1);
    expect(sendPassword).toHaveBeenCalledWith(user.email, user.reset_password_link, user.plain_password);
  });

  it(createTestName('create user failed with authentication error', HttpStatus.UNAUTHORIZED), async () => {
    expect.hasAssertions();
    const sendPassword = jest.spyOn(sendEmailService, 'sendPassword').mockResolvedValue({});
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(user));
    const createUserService = jest.spyOn(userService, 'signup');
    await api
      .post(createUserUrl)
      .send(requestBody)
      .expect(HttpStatus.UNAUTHORIZED)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.DID_NOT_LOGIN));
    expect(createUserService).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
    expect(sendPassword).not.toHaveBeenCalled();
  });

  it(createTestName('create user failed with user do not have permission', HttpStatus.UNAUTHORIZED), async () => {
    expect.hasAssertions();
    const sendPassword = jest.spyOn(sendEmailService, 'sendPassword').mockResolvedValue({});
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(user));
    const createUserService = jest.spyOn(userService, 'signup');
    await api
      .post(createUserUrl)
      .set('mock-session', JSON.stringify({ ...sessionPayload, power: POWER_NUMERIC.SALE }))
      .send(requestBody)
      .expect(HttpStatus.UNAUTHORIZED)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.DO_NOT_PERMISSION));
    expect(createUserService).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
    expect(sendPassword).not.toHaveBeenCalled();
  });

  it(createTestName('create user failed with rpc unknown error', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const sendPassword = jest.spyOn(sendEmailService, 'sendPassword');
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new BadRequestException(createMessage(messages.COMMON.COMMON_ERROR))));
    const createUserService = jest.spyOn(userService, 'signup');
    await api
      .post(createUserUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(requestBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.COMMON.COMMON_ERROR));
    expect(createUserService).toHaveBeenCalledTimes(1);
    expect(createUserService).toHaveBeenCalledWith(userCreate);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(signupPattern, userCreate);
    expect(sendPassword).not.toHaveBeenCalled();
  });

  it(createTestName('create user failed with unknown error', HttpStatus.INTERNAL_SERVER_ERROR), async () => {
    expect.hasAssertions();
    const sendPassword = jest.spyOn(sendEmailService, 'sendPassword');
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => UnknownError));
    const createUserService = jest.spyOn(userService, 'signup');
    await api
      .post(createUserUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(requestBody)
      .expect(HttpStatus.INTERNAL_SERVER_ERROR)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(new InternalServerErrorException().message));
    expect(createUserService).toHaveBeenCalledTimes(1);
    expect(createUserService).toHaveBeenCalledWith(userCreate);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(signupPattern, userCreate);
    expect(sendPassword).not.toHaveBeenCalled();
  });

  it(createTestName('create user failed when sendPassword failed', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const sendPassword = jest.spyOn(sendEmailService, 'sendPassword').mockRejectedValue(UnknownError);
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(user));
    const createUserService = jest.spyOn(userService, 'signup');
    await api
      .post(createUserUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(requestBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.CREATE_USER_FAILED));
    expect(createUserService).toHaveBeenCalledTimes(1);
    expect(createUserService).toHaveBeenCalledWith(userCreate);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(signupPattern, userCreate);
    expect(sendPassword).toHaveBeenCalledTimes(1);
    expect(sendPassword).toHaveBeenCalledWith(user.email, user.reset_password_link, user.plain_password);
  });

  it(createTestName('create user failed with database disconnect error', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const sendPassword = jest.spyOn(sendEmailService, 'sendPassword');
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new BadRequestException(PrismaDisconnectError.message)));
    const createUserService = jest.spyOn(userService, 'signup');
    await api
      .post(createUserUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(requestBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.COMMON.DATABASE_DISCONNECT));
    expect(createUserService).toHaveBeenCalledTimes(1);
    expect(createUserService).toHaveBeenCalledWith(userCreate);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(signupPattern, userCreate);
    expect(sendPassword).not.toHaveBeenCalled();
  });

  it(createTestName('create user failed with server error', HttpStatus.INTERNAL_SERVER_ERROR), async () => {
    expect.hasAssertions();
    const sendPassword = jest.spyOn(sendEmailService, 'sendPassword');
    const serverError = new InternalServerErrorException();
    const createUserService = jest.spyOn(userService, 'signup');
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => serverError));
    await api
      .post(createUserUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(requestBody)
      .expect(HttpStatus.INTERNAL_SERVER_ERROR)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(serverError.message));
    expect(createUserService).toHaveBeenCalledTimes(1);
    expect(createUserService).toHaveBeenCalledWith(userCreate);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(signupPattern, userCreate);
    expect(sendPassword).not.toHaveBeenCalled();
  });

  it(createTestName('create user failed with sex invalid', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const sendPassword = jest.spyOn(sendEmailService, 'sendPassword');
    const createUserService = jest.spyOn(userService, 'signup');
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new BadRequestException(createMessage(messages.USER.YOUR_GENDER_INVALID))));
    await api
      .post(createUserUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(requestBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.YOUR_GENDER_INVALID));
    expect(createUserService).toHaveBeenCalledTimes(1);
    expect(createUserService).toHaveBeenCalledWith(userCreate);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(signupPattern, userCreate);
    expect(sendPassword).not.toHaveBeenCalled();
  });

  it(createTestName('create user failed with power invalid', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const sendPassword = jest.spyOn(sendEmailService, 'sendPassword');
    const createUserService = jest.spyOn(userService, 'signup');
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new BadRequestException(createMessage(messages.USER.YOUR_POWER_INVALID))));
    await api
      .post(createUserUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(requestBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.YOUR_POWER_INVALID));
    expect(createUserService).toHaveBeenCalledTimes(1);
    expect(createUserService).toHaveBeenCalledWith(userCreate);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(signupPattern, userCreate);
    expect(sendPassword).not.toHaveBeenCalled();
  });

  it(createTestName('create user failed with email was already exist', HttpStatus.UNAUTHORIZED), async () => {
    expect.hasAssertions();
    const sendPassword = jest.spyOn(sendEmailService, 'sendPassword');
    const createUserService = jest.spyOn(userService, 'signup');
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(
        throwError(() => new UnauthorizedException(createMessage(messages.USER.EMAIL_REGIS_ALREADY_EXIST))),
      );
    await api
      .post(createUserUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(requestBody)
      .expect(HttpStatus.UNAUTHORIZED)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.EMAIL_REGIS_ALREADY_EXIST));
    expect(createUserService).toHaveBeenCalledTimes(1);
    expect(createUserService).toHaveBeenCalledWith(userCreate);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(signupPattern, userCreate);
    expect(sendPassword).not.toHaveBeenCalled();
  });

  it(createTestName('create user failed with phone was already exist', HttpStatus.UNAUTHORIZED), async () => {
    expect.hasAssertions();
    const sendPassword = jest.spyOn(sendEmailService, 'sendPassword');
    const createUserService = jest.spyOn(userService, 'signup');
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new UnauthorizedException(createMessage(messages.USER.PHONE_ALREADY_EXIST))));
    await api
      .post(createUserUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(requestBody)
      .expect(HttpStatus.UNAUTHORIZED)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.PHONE_ALREADY_EXIST));
    expect(createUserService).toHaveBeenCalledTimes(1);
    expect(createUserService).toHaveBeenCalledWith(userCreate);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(signupPattern, userCreate);
    expect(sendPassword).not.toHaveBeenCalled();
  });
});

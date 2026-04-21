import {
  BadRequestException,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  RequestMethod,
  UnauthorizedException,
} from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { UserRouter } from '@share/router';
import TestAgent from 'supertest/lib/agent';
import { ClientProxy } from '@nestjs/microservices';
import UserService from '../user.service';
import UserModule from '../user.module';
import startUp from './pre-setup';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import { HTTP_METHOD, POWER_NUMERIC } from '@share/enums';
import { user, sessionPayload, apiKey } from '@share/test/pre-setup/mock/data/user';
import { createDescribeTest, createTestName, getMockModule } from '@share/test/helpers';
import { createMessage, createMessages, signApiKey } from '@share/utils';
import messages from '@share/constants/messages';
import constants from '@share/constants';
import { PrismaDisconnectError } from '@share/test/pre-setup/mock/errors/prisma-errors';
import { UpdateUser } from '@share/dto/validators/user.dto';
import { updateUserPattern } from '@share/pattern';
const updateUserUrl = UserRouter.absolute.update;
const MockUserModule = getMockModule(UserModule, { path: updateUserUrl, method: RequestMethod.PUT });

let api: TestAgent;
let clientProxy: ClientProxy;
let close: () => Promise<void>;
let userService: UserService;

const requestBody = {
  userId: user.user_id,
  firstName: user.first_name,
  lastName: user.last_name,
  email: user.email,
  phone: user.phone,
  sex: user.sex,
  power: POWER_NUMERIC.ADMIN,
};
const userUpdate = UpdateUser.plain(requestBody);
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

describe(createDescribeTest(HTTP_METHOD.PUT, updateUserUrl), () => {
  it(createTestName('update user success', HttpStatus.CREATED), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(user));
    const updateUserService = jest.spyOn(userService, 'updateUser');
    await api
      .put(updateUserUrl)
      .set('Cookie', [`${constants.IMPACT_USER_API_KEY}=${missMatchUserIdApiKey}`])
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(requestBody)
      .expect(HttpStatus.CREATED)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.UPDATE_USER_SUCCESS));
    expect(updateUserService).toHaveBeenCalledTimes(1);
    expect(updateUserService).toHaveBeenCalledWith(userUpdate);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(updateUserPattern, userUpdate);
  });

  it(createTestName('update user failed with authentication error', HttpStatus.UNAUTHORIZED), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(user));
    const updateUserService = jest.spyOn(userService, 'updateUser');
    await api
      .put(updateUserUrl)
      .set('Cookie', [`${constants.IMPACT_USER_API_KEY}=${apiKey}`])
      .send(requestBody)
      .expect(HttpStatus.UNAUTHORIZED)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.DID_NOT_LOGIN));
    expect(updateUserService).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(createTestName('update user failed with API key not set', HttpStatus.UNAUTHORIZED), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(user));
    const updateUserService = jest.spyOn(userService, 'updateUser');
    await api
      .put(updateUserUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(requestBody)
      .expect(HttpStatus.UNAUTHORIZED)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.API_KEY_INVALID));
    expect(updateUserService).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(createTestName('update user failed when update self information', HttpStatus.UNAUTHORIZED), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(user));
    const updateUserService = jest.spyOn(userService, 'updateUser');
    await api
      .put(updateUserUrl)
      .set('Cookie', [`${constants.IMPACT_USER_API_KEY}=${apiKey}`])
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(requestBody)
      .expect(HttpStatus.UNAUTHORIZED)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.DO_NOT_CHANGE_YOURSELF));
    expect(updateUserService).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(createTestName('update user failed when user have not permission', HttpStatus.UNAUTHORIZED), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(user));
    const updateUserService = jest.spyOn(userService, 'updateUser');
    await api
      .put(updateUserUrl)
      .set('Cookie', [`${constants.IMPACT_USER_API_KEY}=${apiKey}`])
      .set('mock-session', JSON.stringify(invalidPowerSessionPayload))
      .send(requestBody)
      .expect(HttpStatus.UNAUTHORIZED)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.DO_NOT_PERMISSION));
    expect(updateUserService).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(createTestName('update user failed with rpc unknown error', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new BadRequestException(createMessage(messages.COMMON.COMMON_ERROR))));
    const updateUserService = jest.spyOn(userService, 'updateUser');
    await api
      .put(updateUserUrl)
      .set('Cookie', [`${constants.IMPACT_USER_API_KEY}=${missMatchUserIdApiKey}`])
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(requestBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.COMMON.COMMON_ERROR));
    expect(updateUserService).toHaveBeenCalledTimes(1);
    expect(updateUserService).toHaveBeenCalledWith(userUpdate);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(updateUserPattern, userUpdate);
  });

  it(createTestName('update user failed with unknown error', HttpStatus.INTERNAL_SERVER_ERROR), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => UnknownError));
    const updateUserService = jest.spyOn(userService, 'updateUser');
    await api
      .put(updateUserUrl)
      .set('Cookie', [`${constants.IMPACT_USER_API_KEY}=${missMatchUserIdApiKey}`])
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(requestBody)
      .expect(HttpStatus.INTERNAL_SERVER_ERROR)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(new InternalServerErrorException().message));
    expect(updateUserService).toHaveBeenCalledTimes(1);
    expect(updateUserService).toHaveBeenCalledWith(userUpdate);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(updateUserPattern, userUpdate);
  });

  it(createTestName('update user failed with not found error', HttpStatus.NOT_FOUND), async () => {
    expect.hasAssertions();
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new NotFoundException(messages.USER.NOT_FOUND)));
    const updateUserService = jest.spyOn(userService, 'updateUser');
    await api
      .put(updateUserUrl)
      .set('Cookie', [`${constants.IMPACT_USER_API_KEY}=${missMatchUserIdApiKey}`])
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(requestBody)
      .expect(HttpStatus.NOT_FOUND)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.NOT_FOUND));
    expect(updateUserService).toHaveBeenCalledTimes(1);
    expect(updateUserService).toHaveBeenCalledWith(userUpdate);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(updateUserPattern, userUpdate);
  });

  it(createTestName('update user failed with database disconnect error', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new BadRequestException(PrismaDisconnectError.message)));
    const updateUserService = jest.spyOn(userService, 'updateUser');
    await api
      .put(updateUserUrl)
      .set('Cookie', [`${constants.IMPACT_USER_API_KEY}=${missMatchUserIdApiKey}`])
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(requestBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.COMMON.DATABASE_DISCONNECT));
    expect(updateUserService).toHaveBeenCalledTimes(1);
    expect(updateUserService).toHaveBeenCalledWith(userUpdate);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(updateUserPattern, userUpdate);
  });

  it(createTestName('update user failed with server error', HttpStatus.INTERNAL_SERVER_ERROR), async () => {
    expect.hasAssertions();
    const serverError = new InternalServerErrorException();
    const updateUserService = jest.spyOn(userService, 'updateUser');
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => serverError));
    await api
      .put(updateUserUrl)
      .set('Cookie', [`${constants.IMPACT_USER_API_KEY}=${missMatchUserIdApiKey}`])
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(requestBody)
      .expect(HttpStatus.INTERNAL_SERVER_ERROR)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(serverError.message));
    expect(updateUserService).toHaveBeenCalledTimes(1);
    expect(updateUserService).toHaveBeenCalledWith(userUpdate);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(updateUserPattern, userUpdate);
  });

  it(createTestName('update user failed with sex invalid', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const updateUserService = jest.spyOn(userService, 'updateUser');
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new BadRequestException(createMessage(messages.USER.YOUR_GENDER_INVALID))));
    await api
      .put(updateUserUrl)
      .set('Cookie', [`${constants.IMPACT_USER_API_KEY}=${missMatchUserIdApiKey}`])
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(requestBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.YOUR_GENDER_INVALID));
    expect(updateUserService).toHaveBeenCalledTimes(1);
    expect(updateUserService).toHaveBeenCalledWith(userUpdate);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(updateUserPattern, userUpdate);
  });

  it(createTestName('update user failed with power invalid', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const updateUserService = jest.spyOn(userService, 'updateUser');
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new BadRequestException(createMessage(messages.USER.YOUR_POWER_INVALID))));
    await api
      .put(updateUserUrl)
      .set('Cookie', [`${constants.IMPACT_USER_API_KEY}=${missMatchUserIdApiKey}`])
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(requestBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.YOUR_POWER_INVALID));
    expect(updateUserService).toHaveBeenCalledTimes(1);
    expect(updateUserService).toHaveBeenCalledWith(userUpdate);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(updateUserPattern, userUpdate);
  });

  it(createTestName('update user failed with email was already exist', HttpStatus.UNAUTHORIZED), async () => {
    expect.hasAssertions();
    const updateUserService = jest.spyOn(userService, 'updateUser');
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(
        throwError(() => new UnauthorizedException(createMessage(messages.USER.EMAIL_REGIS_ALREADY_EXIST))),
      );
    await api
      .put(updateUserUrl)
      .set('Cookie', [`${constants.IMPACT_USER_API_KEY}=${missMatchUserIdApiKey}`])
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(requestBody)
      .expect(HttpStatus.UNAUTHORIZED)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.EMAIL_REGIS_ALREADY_EXIST));
    expect(updateUserService).toHaveBeenCalledTimes(1);
    expect(updateUserService).toHaveBeenCalledWith(userUpdate);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(updateUserPattern, userUpdate);
  });

  it(createTestName('update user failed with phone was already exist', HttpStatus.UNAUTHORIZED), async () => {
    expect.hasAssertions();
    const updateUserService = jest.spyOn(userService, 'updateUser');
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new UnauthorizedException(createMessage(messages.USER.PHONE_ALREADY_EXIST))));
    await api
      .put(updateUserUrl)
      .set('Cookie', [`${constants.IMPACT_USER_API_KEY}=${missMatchUserIdApiKey}`])
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(requestBody)
      .expect(HttpStatus.UNAUTHORIZED)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.PHONE_ALREADY_EXIST));
    expect(updateUserService).toHaveBeenCalledTimes(1);
    expect(updateUserService).toHaveBeenCalledWith(userUpdate);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(updateUserPattern, userUpdate);
  });
});

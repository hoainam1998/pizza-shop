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
import { UpdatePower } from '@share/dto/validators/user.dto';
import { updatePowerPattern } from '@share/pattern';
import UserCachingService from '@share/libs/caching/user/user.service';
const updateUserPowerUrl = UserRouter.absolute.updatePower;
const MockUserModule = getMockModule(UserModule, { path: updateUserPowerUrl, method: RequestMethod.PUT });

let api: TestAgent;
let clientProxy: ClientProxy;
let close: () => Promise<void>;
let userService: UserService;
let userCachingService: UserCachingService;

const requestBody: any = {
  userId: user.user_id,
  power: POWER_NUMERIC.ADMIN,
};
const powerUpdatePayload = UpdatePower.plain(requestBody);
const invalidPowerSessionPayload = { ...sessionPayload, power: POWER_NUMERIC.SALE };
const missMatchUserIdApiKey = signApiKey({ userId: Date.now().toString(), email: user.email, power: user.power });

beforeAll(async () => {
  const requestTest = await startUp(MockUserModule);
  api = requestTest.api;
  clientProxy = requestTest.clientProxy;
  close = () => requestTest.app.close();
  userService = requestTest.app.get(UserService);
  userCachingService = requestTest.app.get(UserCachingService);
});

afterEach(async () => {
  if (close) {
    await close();
  }
});

describe(createDescribeTest(HTTP_METHOD.PUT, updateUserPowerUrl), () => {
  it(createTestName('update user power success', HttpStatus.CREATED), async () => {
    expect.hasAssertions();
    jest.spyOn(userCachingService, 'getUserApiKey').mockResolvedValue(missMatchUserIdApiKey);
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(user));
    const updateUserPowerService = jest.spyOn(userService, 'updatePower');
    await api
      .put(updateUserPowerUrl)
      .set('Cookie', [`${constants.IMPACT_USER_API_KEY}=${missMatchUserIdApiKey}`])
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(requestBody)
      .expect(HttpStatus.CREATED)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.UPDATE_USER_POWER_SUCCESS));
    expect(updateUserPowerService).toHaveBeenCalledTimes(1);
    expect(updateUserPowerService).toHaveBeenCalledWith(powerUpdatePayload);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(updatePowerPattern, powerUpdatePayload);
  });

  it(createTestName('update user power failed with authentication error', HttpStatus.UNAUTHORIZED), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(user));
    const updateUserPowerService = jest.spyOn(userService, 'updateUser');
    await api
      .put(updateUserPowerUrl)
      .set('Cookie', [`${constants.IMPACT_USER_API_KEY}=${apiKey}`])
      .send(requestBody)
      .expect(HttpStatus.UNAUTHORIZED)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.DID_NOT_LOGIN));
    expect(updateUserPowerService).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(createTestName('update user power failed with API key not set', HttpStatus.UNAUTHORIZED), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(user));
    const updateUserPowerService = jest.spyOn(userService, 'updateUser');
    await api
      .put(updateUserPowerUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(requestBody)
      .expect(HttpStatus.UNAUTHORIZED)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.API_KEY_INVALID));
    expect(updateUserPowerService).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(createTestName('update user power failed with API key do not match', HttpStatus.UNAUTHORIZED), async () => {
    expect.hasAssertions();
    jest.spyOn(userCachingService, 'getUserApiKey').mockResolvedValue(null);
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(user));
    const updateUserPowerService = jest.spyOn(userService, 'updateUser');
    await api
      .put(updateUserPowerUrl)
      .set('Cookie', [`${constants.IMPACT_USER_API_KEY}=${apiKey}`])
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(requestBody)
      .expect(HttpStatus.UNAUTHORIZED)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.USER_INFO_OUT_OF_DATE));
    expect(updateUserPowerService).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(createTestName('update user power failed when update self information', HttpStatus.UNAUTHORIZED), async () => {
    expect.hasAssertions();
    jest.spyOn(userCachingService, 'getUserApiKey').mockResolvedValue(apiKey);
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(user));
    const updateUserPowerService = jest.spyOn(userService, 'updateUser');
    await api
      .put(updateUserPowerUrl)
      .set('Cookie', [`${constants.IMPACT_USER_API_KEY}=${apiKey}`])
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(requestBody)
      .expect(HttpStatus.UNAUTHORIZED)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.DO_NOT_CHANGE_YOURSELF));
    expect(updateUserPowerService).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(createTestName('update user power failed when user have not permission', HttpStatus.UNAUTHORIZED), async () => {
    expect.hasAssertions();
    jest.spyOn(userCachingService, 'getUserApiKey').mockResolvedValue(apiKey);
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(user));
    const updateUserPowerService = jest.spyOn(userService, 'updateUser');
    await api
      .put(updateUserPowerUrl)
      .set('Cookie', [`${constants.IMPACT_USER_API_KEY}=${apiKey}`])
      .set('mock-session', JSON.stringify(invalidPowerSessionPayload))
      .send(requestBody)
      .expect(HttpStatus.UNAUTHORIZED)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.DO_NOT_PERMISSION));
    expect(updateUserPowerService).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(
    createTestName('update user power failed when user update with super admin role', HttpStatus.BAD_REQUEST),
    async () => {
      expect.hasAssertions();
      const requestBodyWithInvalidPower = {
        power: POWER_NUMERIC.SUPER_ADMIN,
      };
      jest.spyOn(userCachingService, 'getUserApiKey').mockResolvedValue(missMatchUserIdApiKey);
      const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(user));
      const updateUserPowerService = jest.spyOn(userService, 'updateUser');
      const response = await api
        .put(updateUserPowerUrl)
        .set('Cookie', [`${constants.IMPACT_USER_API_KEY}=${missMatchUserIdApiKey}`])
        .set('mock-session', JSON.stringify(sessionPayload))
        .send(requestBodyWithInvalidPower)
        .expect(HttpStatus.BAD_REQUEST)
        .expect('Content-Type', /application\/json/);
      expect(response.body).toEqual({ messages: expect.any(Array) });
      expect(updateUserPowerService).not.toHaveBeenCalled();
      expect(send).not.toHaveBeenCalled();
    },
  );

  it(createTestName('update user power failed with rpc unknown error', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    jest.spyOn(userCachingService, 'getUserApiKey').mockResolvedValue(missMatchUserIdApiKey);
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new BadRequestException(createMessage(messages.COMMON.COMMON_ERROR))));
    const updateUserPowerService = jest.spyOn(userService, 'updatePower');
    await api
      .put(updateUserPowerUrl)
      .set('Cookie', [`${constants.IMPACT_USER_API_KEY}=${missMatchUserIdApiKey}`])
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(requestBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.COMMON.COMMON_ERROR));
    expect(updateUserPowerService).toHaveBeenCalledTimes(1);
    expect(updateUserPowerService).toHaveBeenCalledWith(powerUpdatePayload);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(updatePowerPattern, powerUpdatePayload);
  });

  it(createTestName('update user power failed with unknown error', HttpStatus.INTERNAL_SERVER_ERROR), async () => {
    expect.hasAssertions();
    jest.spyOn(userCachingService, 'getUserApiKey').mockResolvedValue(missMatchUserIdApiKey);
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => UnknownError));
    const updateUserPowerService = jest.spyOn(userService, 'updatePower');
    await api
      .put(updateUserPowerUrl)
      .set('Cookie', [`${constants.IMPACT_USER_API_KEY}=${missMatchUserIdApiKey}`])
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(requestBody)
      .expect(HttpStatus.INTERNAL_SERVER_ERROR)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(new InternalServerErrorException().message));
    expect(updateUserPowerService).toHaveBeenCalledTimes(1);
    expect(updateUserPowerService).toHaveBeenCalledWith(powerUpdatePayload);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(updatePowerPattern, powerUpdatePayload);
  });

  it(createTestName('update user power failed with not found error', HttpStatus.NOT_FOUND), async () => {
    expect.hasAssertions();
    jest.spyOn(userCachingService, 'getUserApiKey').mockResolvedValue(missMatchUserIdApiKey);
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new NotFoundException(messages.USER.NOT_FOUND)));
    const updateUserPowerService = jest.spyOn(userService, 'updatePower');
    await api
      .put(updateUserPowerUrl)
      .set('Cookie', [`${constants.IMPACT_USER_API_KEY}=${missMatchUserIdApiKey}`])
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(requestBody)
      .expect(HttpStatus.NOT_FOUND)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.NOT_FOUND));
    expect(updateUserPowerService).toHaveBeenCalledTimes(1);
    expect(updateUserPowerService).toHaveBeenCalledWith(powerUpdatePayload);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(updatePowerPattern, powerUpdatePayload);
  });

  it(createTestName('update user power failed with database disconnect error', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    jest.spyOn(userCachingService, 'getUserApiKey').mockResolvedValue(missMatchUserIdApiKey);
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new BadRequestException(PrismaDisconnectError.message)));
    const updateUserPowerService = jest.spyOn(userService, 'updatePower');
    await api
      .put(updateUserPowerUrl)
      .set('Cookie', [`${constants.IMPACT_USER_API_KEY}=${missMatchUserIdApiKey}`])
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(requestBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.COMMON.DATABASE_DISCONNECT));
    expect(updateUserPowerService).toHaveBeenCalledTimes(1);
    expect(updateUserPowerService).toHaveBeenCalledWith(powerUpdatePayload);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(updatePowerPattern, powerUpdatePayload);
  });

  it(createTestName('update user power failed with server error', HttpStatus.INTERNAL_SERVER_ERROR), async () => {
    expect.hasAssertions();
    jest.spyOn(userCachingService, 'getUserApiKey').mockResolvedValue(missMatchUserIdApiKey);
    const serverError = new InternalServerErrorException();
    const updateUserPowerService = jest.spyOn(userService, 'updatePower');
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => serverError));
    await api
      .put(updateUserPowerUrl)
      .set('Cookie', [`${constants.IMPACT_USER_API_KEY}=${missMatchUserIdApiKey}`])
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(requestBody)
      .expect(HttpStatus.INTERNAL_SERVER_ERROR)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(serverError.message));
    expect(updateUserPowerService).toHaveBeenCalledTimes(1);
    expect(updateUserPowerService).toHaveBeenCalledWith(powerUpdatePayload);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(updatePowerPattern, powerUpdatePayload);
  });

  it(createTestName('update user power failed with user have not reset password', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    jest.spyOn(userCachingService, 'getUserApiKey').mockResolvedValue(missMatchUserIdApiKey);
    const updateUserPowerService = jest.spyOn(userService, 'updatePower');
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new BadRequestException(messages.USER.NOT_UPDATE_POWER_WHO_HAVE_FIRST_LOGIN)));
    await api
      .put(updateUserPowerUrl)
      .set('Cookie', [`${constants.IMPACT_USER_API_KEY}=${missMatchUserIdApiKey}`])
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(requestBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.NOT_UPDATE_POWER_WHO_HAVE_FIRST_LOGIN));
    expect(updateUserPowerService).toHaveBeenCalledTimes(1);
    expect(updateUserPowerService).toHaveBeenCalledWith(powerUpdatePayload);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(updatePowerPattern, powerUpdatePayload);
  });
});

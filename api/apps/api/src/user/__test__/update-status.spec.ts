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
import { UpdateStatus } from '@share/dto/validators/user.dto';
import { updateStatusPattern } from '@share/pattern';
import UserCachingService from '@share/libs/caching/user/user.service';
import { ALLOW_VALID_API_KEY_GUARD } from '@share/di-token';
import AllowValidApiKeyGuard from '@share/guards/allow-valid-api-key.service';
const updateUserStatusUrl = UserRouter.absolute.updateStatus;
const MockUserModule = getMockModule(UserModule, { path: updateUserStatusUrl, method: RequestMethod.PUT });

let api: TestAgent;
let clientProxy: ClientProxy;
let close: () => Promise<void>;
let userService: UserService;
let userCachingService: UserCachingService;
let allowValidApiKeyGuard: AllowValidApiKeyGuard;

const requestBody: any = {
  userId: user.user_id,
  active: user.active,
};
const statusUpdatePayload = UpdateStatus.plain(requestBody);
const invalidPowerSessionPayload = { ...sessionPayload, power: POWER_NUMERIC.SALE };
const missMatchUserIdApiKey = signApiKey({ userId: Date.now().toString(), email: user.email, power: user.power });

beforeAll(async () => {
  const requestTest = await startUp(MockUserModule);
  api = requestTest.api;
  clientProxy = requestTest.clientProxy;
  close = () => requestTest.app.close();
  userService = requestTest.app.get(UserService);
  userCachingService = requestTest.app.get(UserCachingService);
  allowValidApiKeyGuard = requestTest.app.get(ALLOW_VALID_API_KEY_GUARD);
});

afterEach(async () => {
  if (close) {
    await close();
  }
});

describe(createDescribeTest(HTTP_METHOD.PUT, updateUserStatusUrl), () => {
  it(createTestName('update user status success', HttpStatus.CREATED), async () => {
    expect.hasAssertions();
    const logoutPublish = jest.spyOn(allowValidApiKeyGuard, 'logoutPublish').mockImplementation(jest.fn);
    jest.spyOn(userCachingService, 'getUserApiKey').mockResolvedValue(missMatchUserIdApiKey);
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(user));
    const updateUserStatusService = jest.spyOn(userService, 'updateStatus');
    await api
      .put(updateUserStatusUrl)
      .set('Cookie', [`${constants.IMPACT_USER_API_KEY}=${missMatchUserIdApiKey}`])
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(requestBody)
      .expect(HttpStatus.CREATED)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.UPDATE_USER_STATUS_SUCCESS));
    expect(logoutPublish).not.toHaveBeenCalled();
    expect(updateUserStatusService).toHaveBeenCalledTimes(1);
    expect(updateUserStatusService).toHaveBeenCalledWith(statusUpdatePayload);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(updateStatusPattern, statusUpdatePayload);
  });

  it(createTestName('update user status failed with authentication error', HttpStatus.UNAUTHORIZED), async () => {
    expect.hasAssertions();
    const logoutPublish = jest.spyOn(allowValidApiKeyGuard, 'logoutPublish').mockImplementation(jest.fn);
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(user));
    const updateUserStatusService = jest.spyOn(userService, 'updateStatus');
    await api
      .put(updateUserStatusUrl)
      .set('Cookie', [`${constants.IMPACT_USER_API_KEY}=${apiKey}`])
      .send(requestBody)
      .expect(HttpStatus.UNAUTHORIZED)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.DID_NOT_LOGIN));
    expect(logoutPublish).not.toHaveBeenCalled();
    expect(updateUserStatusService).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(createTestName('update user status failed with API key not set', HttpStatus.UNAUTHORIZED), async () => {
    expect.hasAssertions();
    const logoutPublish = jest.spyOn(allowValidApiKeyGuard, 'logoutPublish').mockImplementation(jest.fn);
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(user));
    const updateUserStatusService = jest.spyOn(userService, 'updateStatus');
    await api
      .put(updateUserStatusUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(requestBody)
      .expect(HttpStatus.UNAUTHORIZED)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.API_KEY_INVALID));
    expect(logoutPublish).not.toHaveBeenCalled();
    expect(updateUserStatusService).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(createTestName('update user status failed with API key do not match', HttpStatus.UNAUTHORIZED), async () => {
    expect.hasAssertions();
    const logoutPublish = jest.spyOn(allowValidApiKeyGuard, 'logoutPublish').mockImplementation(jest.fn);
    jest.spyOn(userCachingService, 'getUserApiKey').mockResolvedValue(null);
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(user));
    const updateUserStatusService = jest.spyOn(userService, 'updateStatus');
    await api
      .put(updateUserStatusUrl)
      .set('Cookie', [`${constants.IMPACT_USER_API_KEY}=${apiKey}`])
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(requestBody)
      .expect(HttpStatus.UNAUTHORIZED)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.USER_INFO_OUT_OF_DATE));
    expect(logoutPublish).toHaveBeenCalledTimes(1);
    expect(logoutPublish).toHaveBeenCalledWith(sessionPayload?.userId);
    expect(updateUserStatusService).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(createTestName('update user status failed when update self information', HttpStatus.UNAUTHORIZED), async () => {
    expect.hasAssertions();
    const logoutPublish = jest.spyOn(allowValidApiKeyGuard, 'logoutPublish').mockImplementation(jest.fn);
    jest.spyOn(userCachingService, 'getUserApiKey').mockResolvedValue(apiKey);
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(user));
    const updateUserStatusService = jest.spyOn(userService, 'updateStatus');
    await api
      .put(updateUserStatusUrl)
      .set('Cookie', [`${constants.IMPACT_USER_API_KEY}=${apiKey}`])
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(requestBody)
      .expect(HttpStatus.UNAUTHORIZED)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.DO_NOT_CHANGE_YOURSELF));
    expect(logoutPublish).not.toHaveBeenCalled();
    expect(updateUserStatusService).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(createTestName('update user status failed when user have not permission', HttpStatus.UNAUTHORIZED), async () => {
    expect.hasAssertions();
    const logoutPublish = jest.spyOn(allowValidApiKeyGuard, 'logoutPublish').mockImplementation(jest.fn);
    jest.spyOn(userCachingService, 'getUserApiKey').mockResolvedValue(apiKey);
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(user));
    const updateUserStatusService = jest.spyOn(userService, 'updateStatus');
    await api
      .put(updateUserStatusUrl)
      .set('Cookie', [`${constants.IMPACT_USER_API_KEY}=${apiKey}`])
      .set('mock-session', JSON.stringify(invalidPowerSessionPayload))
      .send(requestBody)
      .expect(HttpStatus.UNAUTHORIZED)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.DO_NOT_PERMISSION));
    expect(logoutPublish).not.toHaveBeenCalled();
    expect(updateUserStatusService).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(createTestName('update user status failed when invalid status', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const requestBodyWithInvalidStatus = {
      active: 2,
    };
    const logoutPublish = jest.spyOn(allowValidApiKeyGuard, 'logoutPublish').mockImplementation(jest.fn);
    jest.spyOn(userCachingService, 'getUserApiKey').mockResolvedValue(missMatchUserIdApiKey);
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(user));
    const updateUserStatusService = jest.spyOn(userService, 'updateStatus');
    const response = await api
      .put(updateUserStatusUrl)
      .set('Cookie', [`${constants.IMPACT_USER_API_KEY}=${missMatchUserIdApiKey}`])
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(requestBodyWithInvalidStatus)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/);
    expect(logoutPublish).not.toHaveBeenCalled();
    expect(response.body).toEqual({ messages: expect.any(Array) });
    expect(updateUserStatusService).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(createTestName('update user status failed with rpc unknown error', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const logoutPublish = jest.spyOn(allowValidApiKeyGuard, 'logoutPublish').mockImplementation(jest.fn);
    jest.spyOn(userCachingService, 'getUserApiKey').mockResolvedValue(missMatchUserIdApiKey);
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new BadRequestException(createMessage(messages.COMMON.COMMON_ERROR))));
    const updateUserStatusService = jest.spyOn(userService, 'updateStatus');
    await api
      .put(updateUserStatusUrl)
      .set('Cookie', [`${constants.IMPACT_USER_API_KEY}=${missMatchUserIdApiKey}`])
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(requestBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.COMMON.COMMON_ERROR));
    expect(logoutPublish).not.toHaveBeenCalled();
    expect(updateUserStatusService).toHaveBeenCalledTimes(1);
    expect(updateUserStatusService).toHaveBeenCalledWith(statusUpdatePayload);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(updateStatusPattern, statusUpdatePayload);
  });

  it(createTestName('update user status failed with rpc invalid status error', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const logoutPublish = jest.spyOn(allowValidApiKeyGuard, 'logoutPublish').mockImplementation(jest.fn);
    jest.spyOn(userCachingService, 'getUserApiKey').mockResolvedValue(missMatchUserIdApiKey);
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new BadRequestException(createMessage(messages.USER.YOUR_STATUS_INVALID))));
    const updateUserStatusService = jest.spyOn(userService, 'updateStatus');
    await api
      .put(updateUserStatusUrl)
      .set('Cookie', [`${constants.IMPACT_USER_API_KEY}=${missMatchUserIdApiKey}`])
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(requestBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.YOUR_STATUS_INVALID));
    expect(logoutPublish).not.toHaveBeenCalled();
    expect(updateUserStatusService).toHaveBeenCalledTimes(1);
    expect(updateUserStatusService).toHaveBeenCalledWith(statusUpdatePayload);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(updateStatusPattern, statusUpdatePayload);
  });

  it(createTestName('update user status failed with unknown error', HttpStatus.INTERNAL_SERVER_ERROR), async () => {
    expect.hasAssertions();
    const logoutPublish = jest.spyOn(allowValidApiKeyGuard, 'logoutPublish').mockImplementation(jest.fn);
    jest.spyOn(userCachingService, 'getUserApiKey').mockResolvedValue(missMatchUserIdApiKey);
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => UnknownError));
    const updateUserStatusService = jest.spyOn(userService, 'updateStatus');
    await api
      .put(updateUserStatusUrl)
      .set('Cookie', [`${constants.IMPACT_USER_API_KEY}=${missMatchUserIdApiKey}`])
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(requestBody)
      .expect(HttpStatus.INTERNAL_SERVER_ERROR)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(new InternalServerErrorException().message));
    expect(logoutPublish).not.toHaveBeenCalled();
    expect(updateUserStatusService).toHaveBeenCalledTimes(1);
    expect(updateUserStatusService).toHaveBeenCalledWith(statusUpdatePayload);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(updateStatusPattern, statusUpdatePayload);
  });

  it(createTestName('update user status failed with not found error', HttpStatus.NOT_FOUND), async () => {
    expect.hasAssertions();
    const logoutPublish = jest.spyOn(allowValidApiKeyGuard, 'logoutPublish').mockImplementation(jest.fn);
    jest.spyOn(userCachingService, 'getUserApiKey').mockResolvedValue(missMatchUserIdApiKey);
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new NotFoundException(messages.USER.NOT_FOUND)));
    const updateUserStatusService = jest.spyOn(userService, 'updateStatus');
    await api
      .put(updateUserStatusUrl)
      .set('Cookie', [`${constants.IMPACT_USER_API_KEY}=${missMatchUserIdApiKey}`])
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(requestBody)
      .expect(HttpStatus.NOT_FOUND)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.NOT_FOUND));
    expect(logoutPublish).not.toHaveBeenCalled();
    expect(updateUserStatusService).toHaveBeenCalledTimes(1);
    expect(updateUserStatusService).toHaveBeenCalledWith(statusUpdatePayload);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(updateStatusPattern, statusUpdatePayload);
  });

  it(createTestName('update user status failed with database disconnect error', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const logoutPublish = jest.spyOn(allowValidApiKeyGuard, 'logoutPublish').mockImplementation(jest.fn);
    jest.spyOn(userCachingService, 'getUserApiKey').mockResolvedValue(missMatchUserIdApiKey);
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new BadRequestException(PrismaDisconnectError.message)));
    const updateUserStatusService = jest.spyOn(userService, 'updateStatus');
    await api
      .put(updateUserStatusUrl)
      .set('Cookie', [`${constants.IMPACT_USER_API_KEY}=${missMatchUserIdApiKey}`])
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(requestBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.COMMON.DATABASE_DISCONNECT));
    expect(logoutPublish).not.toHaveBeenCalled();
    expect(updateUserStatusService).toHaveBeenCalledTimes(1);
    expect(updateUserStatusService).toHaveBeenCalledWith(statusUpdatePayload);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(updateStatusPattern, statusUpdatePayload);
  });

  it(createTestName('update user status failed with server error', HttpStatus.INTERNAL_SERVER_ERROR), async () => {
    expect.hasAssertions();
    const logoutPublish = jest.spyOn(allowValidApiKeyGuard, 'logoutPublish').mockImplementation(jest.fn);
    jest.spyOn(userCachingService, 'getUserApiKey').mockResolvedValue(missMatchUserIdApiKey);
    const serverError = new InternalServerErrorException();
    const updateUserStatusService = jest.spyOn(userService, 'updateStatus');
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => serverError));
    await api
      .put(updateUserStatusUrl)
      .set('Cookie', [`${constants.IMPACT_USER_API_KEY}=${missMatchUserIdApiKey}`])
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(requestBody)
      .expect(HttpStatus.INTERNAL_SERVER_ERROR)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(serverError.message));
    expect(logoutPublish).not.toHaveBeenCalled();
    expect(updateUserStatusService).toHaveBeenCalledTimes(1);
    expect(updateUserStatusService).toHaveBeenCalledWith(statusUpdatePayload);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(updateStatusPattern, statusUpdatePayload);
  });
});

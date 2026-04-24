import {
  BadRequestException,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
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
import { HTTP_METHOD } from '@share/enums';
import { user, sessionPayload, apiKey } from '@share/test/pre-setup/mock/data/user';
import { createDescribeTest, createTestName, getMockModule, getStaticFile } from '@share/test/helpers';
import { createMessage, createMessages, signApiKey } from '@share/utils';
import messages from '@share/constants/messages';
import constants from '@share/constants';
import { PrismaDisconnectError } from '@share/test/pre-setup/mock/errors/prisma-errors';
import { UpdatePersonalInfo } from '@share/dto/validators/user.dto';
import { updatePersonalInfoPattern } from '@share/pattern';
import UserCachingService from '@share/libs/caching/user/user.service';
const updatePersonalInfoUrl = UserRouter.absolute.updatePersonalInfo;
const MockUserModule = getMockModule(UserModule, { path: updatePersonalInfoUrl, method: RequestMethod.PUT });

let api: TestAgent;
let clientProxy: ClientProxy;
let close: () => Promise<void>;
let userService: UserService;
let userCachingService: UserCachingService;

const requestBody: any = {
  userId: user.user_id,
  firstName: user.first_name,
  lastName: user.last_name,
  email: user.email,
  phone: user.phone,
  sex: user.sex,
};

const userUpdate = UpdatePersonalInfo.plain(requestBody);
Object.assign(userUpdate, { avatar: expect.any(String) });
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

describe(createDescribeTest(HTTP_METHOD.PUT, updatePersonalInfoUrl), () => {
  it(createTestName('update personal info success', HttpStatus.CREATED), async () => {
    expect.hasAssertions();
    jest.spyOn(userCachingService, 'getUserApiKey').mockResolvedValue(apiKey);
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(user));
    const updateUserService = jest.spyOn(userService, 'updatePersonalInfo');
    await api
      .put(updatePersonalInfoUrl)
      .set('Cookie', [`${constants.IMPACT_USER_API_KEY}=${apiKey}`])
      .set('mock-session', JSON.stringify(sessionPayload))
      .field('userId', user.user_id)
      .field('firstName', user.first_name)
      .field('lastName', user.last_name)
      .field('email', user.email)
      .field('phone', user.phone)
      .field('sex', user.sex)
      .attach('avatar', getStaticFile('test-image.png'))
      .expect(HttpStatus.CREATED)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.UPDATE_PERSONAL_INFO_SUCCESS));
    expect(updateUserService).toHaveBeenCalledTimes(1);
    expect(updateUserService).toHaveBeenCalledWith(userUpdate);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(updatePersonalInfoPattern, userUpdate);
  });

  it(createTestName('update personal info failed with authentication error', HttpStatus.UNAUTHORIZED), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(user));
    const updateUserService = jest.spyOn(userService, 'updatePersonalInfo');
    await api
      .put(updatePersonalInfoUrl)
      .set('Connection', 'keep-alive')
      .field('userIds', user.user_id)
      .field('firstName', user.first_name)
      .field('lastName', user.last_name)
      .field('email', user.email)
      .field('phone', user.phone)
      .field('sex', user.sex)
      .attach('avatar', getStaticFile('test-image.png'))
      .expect(HttpStatus.UNAUTHORIZED)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.DID_NOT_LOGIN));
    expect(updateUserService).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(createTestName('update personal info failed with apiKey not set', HttpStatus.UNAUTHORIZED), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(user));
    const updateUserService = jest.spyOn(userService, 'updatePersonalInfo');
    await api
      .put(updatePersonalInfoUrl)
      .set('Connection', 'keep-alive')
      .set('mock-session', JSON.stringify(sessionPayload))
      .field('userIds', user.user_id)
      .field('firstName', user.first_name)
      .field('lastName', user.last_name)
      .field('email', user.email)
      .field('phone', user.phone)
      .field('sex', user.sex)
      .attach('avatar', getStaticFile('test-image.png'))
      .expect(HttpStatus.UNAUTHORIZED)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.API_KEY_INVALID));
    expect(updateUserService).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(createTestName('update personal info failed with information not match', HttpStatus.UNAUTHORIZED), async () => {
    expect.hasAssertions();
    jest.spyOn(userCachingService, 'getUserApiKey').mockResolvedValue(missMatchUserIdApiKey);
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(user));
    const updateUserService = jest.spyOn(userService, 'updatePersonalInfo');
    await api
      .put(updatePersonalInfoUrl)
      .set('Connection', 'keep-alive')
      .set('Cookie', [`${constants.IMPACT_USER_API_KEY}=${missMatchUserIdApiKey}`])
      .set('mock-session', JSON.stringify(sessionPayload))
      .field('userIds', user.user_id)
      .field('firstName', user.first_name)
      .field('lastName', user.last_name)
      .field('email', user.email)
      .field('phone', user.phone)
      .field('sex', user.sex)
      .attach('avatar', getStaticFile('test-image.png'))
      .expect(HttpStatus.UNAUTHORIZED)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.ONLY_ALLOW_YOUR_SELF));
    expect(updateUserService).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(createTestName('update personal info failed with undefined field', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    jest.spyOn(userCachingService, 'getUserApiKey').mockResolvedValue(apiKey);
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(user));
    const updateUserService = jest.spyOn(userService, 'updatePersonalInfo');
    const response = await api
      .put(updatePersonalInfoUrl)
      .set('Cookie', [`${constants.IMPACT_USER_API_KEY}=${apiKey}`])
      .set('mock-session', JSON.stringify(sessionPayload))
      .field('userIds', user.user_id)
      .field('firstName', user.first_name)
      .field('lastName', user.last_name)
      .field('email', user.email)
      .field('phone', user.phone)
      .field('sex', user.sex)
      .attach('avatar', getStaticFile('test-image.png'))
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/);
    expect(response.body).toEqual({
      messages: expect.any(Array),
    });
    expect(updateUserService).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(createTestName('update personal info failed with avatar empty', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    jest.spyOn(userCachingService, 'getUserApiKey').mockResolvedValue(apiKey);
    const errorMessage = messages.COMMON.EMPTY_FILE.replace(/{fieldname}/, 'avatar');
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(user));
    const updateUserService = jest.spyOn(userService, 'updatePersonalInfo');
    await api
      .put(updatePersonalInfoUrl)
      .set('Cookie', [`${constants.IMPACT_USER_API_KEY}=${apiKey}`])
      .set('mock-session', JSON.stringify(sessionPayload))
      .field('userId', user.user_id)
      .field('firstName', user.first_name)
      .field('lastName', user.last_name)
      .field('email', user.email)
      .field('phone', user.phone)
      .field('sex', user.sex)
      .attach('avatar', getStaticFile('empty.png'))
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(errorMessage));
    expect(updateUserService).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(createTestName('update personal info failed with avatar wrong type', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    jest.spyOn(userCachingService, 'getUserApiKey').mockResolvedValue(apiKey);
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(user));
    const updateUserService = jest.spyOn(userService, 'updatePersonalInfo');
    await api
      .put(updatePersonalInfoUrl)
      .set('Cookie', [`${constants.IMPACT_USER_API_KEY}=${apiKey}`])
      .set('mock-session', JSON.stringify(sessionPayload))
      .field('userId', user.user_id)
      .field('firstName', user.first_name)
      .field('lastName', user.last_name)
      .field('email', user.email)
      .field('phone', user.phone)
      .field('sex', user.sex)
      .attach('avatar', getStaticFile('favicon.ico'))
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.COMMON.FILE_TYPE_INVALID));
    expect(updateUserService).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(createTestName('update personal info failed with missing avatar', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    jest.spyOn(userCachingService, 'getUserApiKey').mockResolvedValue(apiKey);
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(user));
    const updateUserService = jest.spyOn(userService, 'updatePersonalInfo');
    const response = await api
      .put(updatePersonalInfoUrl)
      .set('Cookie', [`${constants.IMPACT_USER_API_KEY}=${apiKey}`])
      .set('mock-session', JSON.stringify(sessionPayload))
      .field('userId', user.user_id)
      .field('firstName', user.first_name)
      .field('lastName', user.last_name)
      .field('email', user.email)
      .field('phone', user.phone)
      .field('sex', user.sex)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/);
    expect(response.body).toEqual(createMessages(expect.any(String)));
    expect(updateUserService).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(createTestName('update personal info failed with missing userId field', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    jest.spyOn(userCachingService, 'getUserApiKey').mockResolvedValue(apiKey);
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(user));
    const updateUserService = jest.spyOn(userService, 'updatePersonalInfo');
    const response = await api
      .put(updatePersonalInfoUrl)
      .set('Cookie', [`${constants.IMPACT_USER_API_KEY}=${apiKey}`])
      .set('mock-session', JSON.stringify(sessionPayload))
      .field('firstName', user.first_name)
      .field('lastName', user.last_name)
      .field('email', user.email)
      .field('phone', user.phone)
      .field('sex', user.sex)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/);
    expect(response.body).toEqual({ messages: expect.any(Array) });
    expect(updateUserService).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(createTestName('update personal info failed with rpc unknown error', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    jest.spyOn(userCachingService, 'getUserApiKey').mockResolvedValue(apiKey);
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new BadRequestException(createMessage(messages.COMMON.COMMON_ERROR))));
    const updateUserService = jest.spyOn(userService, 'updatePersonalInfo');
    await api
      .put(updatePersonalInfoUrl)
      .set('Cookie', [`${constants.IMPACT_USER_API_KEY}=${apiKey}`])
      .set('mock-session', JSON.stringify(sessionPayload))
      .field('userId', user.user_id)
      .field('firstName', user.first_name)
      .field('lastName', user.last_name)
      .field('email', user.email)
      .field('phone', user.phone)
      .field('sex', user.sex)
      .attach('avatar', getStaticFile('test-image.png'))
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.COMMON.COMMON_ERROR));
    expect(updateUserService).toHaveBeenCalledTimes(1);
    expect(updateUserService).toHaveBeenCalledWith(userUpdate);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(updatePersonalInfoPattern, userUpdate);
  });

  it(createTestName('update personal info failed with unknown error', HttpStatus.INTERNAL_SERVER_ERROR), async () => {
    expect.hasAssertions();
    jest.spyOn(userCachingService, 'getUserApiKey').mockResolvedValue(apiKey);
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => UnknownError));
    const updateUserService = jest.spyOn(userService, 'updatePersonalInfo');
    await api
      .put(updatePersonalInfoUrl)
      .set('Cookie', [`${constants.IMPACT_USER_API_KEY}=${apiKey}`])
      .set('mock-session', JSON.stringify(sessionPayload))
      .field('userId', user.user_id)
      .field('firstName', user.first_name)
      .field('lastName', user.last_name)
      .field('email', user.email)
      .field('phone', user.phone)
      .field('sex', user.sex)
      .attach('avatar', getStaticFile('test-image.png'))
      .expect(HttpStatus.INTERNAL_SERVER_ERROR)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(new InternalServerErrorException().message));
    expect(updateUserService).toHaveBeenCalledTimes(1);
    expect(updateUserService).toHaveBeenCalledWith(userUpdate);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(updatePersonalInfoPattern, userUpdate);
  });

  it(createTestName('update personal info failed with not found error', HttpStatus.NOT_FOUND), async () => {
    expect.hasAssertions();
    jest.spyOn(userCachingService, 'getUserApiKey').mockResolvedValue(apiKey);
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new NotFoundException(messages.USER.NOT_FOUND)));
    const updateUserService = jest.spyOn(userService, 'updatePersonalInfo');
    await api
      .put(updatePersonalInfoUrl)
      .set('Cookie', [`${constants.IMPACT_USER_API_KEY}=${apiKey}`])
      .set('mock-session', JSON.stringify(sessionPayload))
      .field('userId', user.user_id)
      .field('firstName', user.first_name)
      .field('lastName', user.last_name)
      .field('email', user.email)
      .field('phone', user.phone)
      .field('sex', user.sex)
      .attach('avatar', getStaticFile('test-image.png'))
      .expect(HttpStatus.NOT_FOUND)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.NOT_FOUND));
    expect(updateUserService).toHaveBeenCalledTimes(1);
    expect(updateUserService).toHaveBeenCalledWith(userUpdate);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(updatePersonalInfoPattern, userUpdate);
  });

  it(createTestName('update personal info failed with database disconnect error', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    jest.spyOn(userCachingService, 'getUserApiKey').mockResolvedValue(apiKey);
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new BadRequestException(PrismaDisconnectError.message)));
    const updateUserService = jest.spyOn(userService, 'updatePersonalInfo');
    await api
      .put(updatePersonalInfoUrl)
      .set('Cookie', [`impact_user_api_key=${apiKey}`])
      .set('mock-session', JSON.stringify(sessionPayload))
      .field('userId', user.user_id)
      .field('firstName', user.first_name)
      .field('lastName', user.last_name)
      .field('email', user.email)
      .field('phone', user.phone)
      .field('sex', user.sex)
      .attach('avatar', getStaticFile('test-image.png'))
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.COMMON.DATABASE_DISCONNECT));
    expect(updateUserService).toHaveBeenCalledTimes(1);
    expect(updateUserService).toHaveBeenCalledWith(userUpdate);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(updatePersonalInfoPattern, userUpdate);
  });

  it(createTestName('update personal info failed with server error', HttpStatus.INTERNAL_SERVER_ERROR), async () => {
    expect.hasAssertions();
    jest.spyOn(userCachingService, 'getUserApiKey').mockResolvedValue(apiKey);
    const serverError = new InternalServerErrorException();
    const updateUserService = jest.spyOn(userService, 'updatePersonalInfo');
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => serverError));
    await api
      .put(updatePersonalInfoUrl)
      .set('Cookie', [`${constants.IMPACT_USER_API_KEY}=${apiKey}`])
      .set('mock-session', JSON.stringify(sessionPayload))
      .field('userId', user.user_id)
      .field('firstName', user.first_name)
      .field('lastName', user.last_name)
      .field('email', user.email)
      .field('phone', user.phone)
      .field('sex', user.sex)
      .attach('avatar', getStaticFile('test-image.png'))
      .expect(HttpStatus.INTERNAL_SERVER_ERROR)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(serverError.message));
    expect(updateUserService).toHaveBeenCalledTimes(1);
    expect(updateUserService).toHaveBeenCalledWith(userUpdate);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(updatePersonalInfoPattern, userUpdate);
  });

  it(createTestName('update personal info failed with sex invalid', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    jest.spyOn(userCachingService, 'getUserApiKey').mockResolvedValue(apiKey);
    const updateUserService = jest.spyOn(userService, 'updatePersonalInfo');
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new BadRequestException(createMessage(messages.USER.YOUR_GENDER_INVALID))));
    await api
      .put(updatePersonalInfoUrl)
      .set('Cookie', [`${constants.IMPACT_USER_API_KEY}=${apiKey}`])
      .set('mock-session', JSON.stringify(sessionPayload))
      .field('userId', user.user_id)
      .field('firstName', user.first_name)
      .field('lastName', user.last_name)
      .field('email', user.email)
      .field('phone', user.phone)
      .field('sex', user.sex)
      .attach('avatar', getStaticFile('test-image.png'))
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.YOUR_GENDER_INVALID));
    expect(updateUserService).toHaveBeenCalledTimes(1);
    expect(updateUserService).toHaveBeenCalledWith(userUpdate);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(updatePersonalInfoPattern, userUpdate);
  });

  it(createTestName('update personal info failed with email was already exist', HttpStatus.UNAUTHORIZED), async () => {
    expect.hasAssertions();
    jest.spyOn(userCachingService, 'getUserApiKey').mockResolvedValue(apiKey);
    const updateUserService = jest.spyOn(userService, 'updatePersonalInfo');
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(
        throwError(() => new UnauthorizedException(createMessage(messages.USER.EMAIL_REGIS_ALREADY_EXIST))),
      );
    await api
      .put(updatePersonalInfoUrl)
      .set('Cookie', [`${constants.IMPACT_USER_API_KEY}=${apiKey}`])
      .set('mock-session', JSON.stringify(sessionPayload))
      .field('userId', user.user_id)
      .field('firstName', user.first_name)
      .field('lastName', user.last_name)
      .field('email', user.email)
      .field('phone', user.phone)
      .field('sex', user.sex)
      .attach('avatar', getStaticFile('test-image.png'))
      .expect(HttpStatus.UNAUTHORIZED)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.EMAIL_REGIS_ALREADY_EXIST));
    expect(updateUserService).toHaveBeenCalledTimes(1);
    expect(updateUserService).toHaveBeenCalledWith(userUpdate);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(updatePersonalInfoPattern, userUpdate);
  });

  it(createTestName('update personal info failed with phone was already exist', HttpStatus.UNAUTHORIZED), async () => {
    expect.hasAssertions();
    jest.spyOn(userCachingService, 'getUserApiKey').mockResolvedValue(apiKey);
    const updateUserService = jest.spyOn(userService, 'updatePersonalInfo');
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new UnauthorizedException(createMessage(messages.USER.PHONE_ALREADY_EXIST))));
    await api
      .put(updatePersonalInfoUrl)
      .set('Cookie', [`${constants.IMPACT_USER_API_KEY}=${apiKey}`])
      .set('mock-session', JSON.stringify(sessionPayload))
      .field('userId', user.user_id)
      .field('firstName', user.first_name)
      .field('lastName', user.last_name)
      .field('email', user.email)
      .field('phone', user.phone)
      .field('sex', user.sex)
      .attach('avatar', getStaticFile('test-image.png'))
      .expect(HttpStatus.UNAUTHORIZED)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.PHONE_ALREADY_EXIST));
    expect(updateUserService).toHaveBeenCalledTimes(1);
    expect(updateUserService).toHaveBeenCalledWith(userUpdate);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(updatePersonalInfoPattern, userUpdate);
  });
});

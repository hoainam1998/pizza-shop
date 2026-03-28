import {
  BadRequestException,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { UserRouter } from '@share/router';
import TestAgent from 'supertest/lib/agent';
import { ClientProxy } from '@nestjs/microservices';
import UserService from '../user.service';
import startUp from './pre-setup';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import { HTTP_METHOD } from '@share/enums';
import { user } from '@share/test/pre-setup/mock/data/user';
import { createDescribeTest, createTestName } from '@share/test/helpers';
import { createMessage, createMessages } from '@share/utils';
import messages from '@share/constants/messages';
import { PrismaDisconnectError } from '@share/test/pre-setup/mock/errors/prisma-errors';
import { UpdatePersonalInfo } from '@share/dto/validators/user.dto';
import { updatePersonalInfoPattern } from '@share/pattern';
const updatePersonalInfoUrl = UserRouter.absolute.updatePersonalInfo;

let api: TestAgent;
let clientProxy: ClientProxy;
let close: () => Promise<void>;
let userService: UserService;

const requestBody: any = {
  userId: user.user_id,
  firstName: user.first_name,
  lastName: user.last_name,
  email: user.email,
  phone: user.phone,
  sex: user.sex,
};
const userUpdate = UpdatePersonalInfo.plain(requestBody);

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

describe(createDescribeTest(HTTP_METHOD.PUT, updatePersonalInfoUrl), () => {
  it(createTestName('update personal info success', HttpStatus.OK), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(user));
    const updateUserService = jest.spyOn(userService, 'updatePersonalInfo');
    await api
      .put(updatePersonalInfoUrl)
      .send(requestBody)
      .expect(HttpStatus.CREATED)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.UPDATE_PERSONAL_INFO_SUCCESS));
    expect(updateUserService).toHaveBeenCalledTimes(1);
    expect(updateUserService).toHaveBeenCalledWith(userUpdate);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(updatePersonalInfoPattern, userUpdate);
  });

  it(createTestName('update personal info failed with rpc unknown error', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new BadRequestException(createMessage(messages.COMMON.COMMON_ERROR))));
    const updateUserService = jest.spyOn(userService, 'updatePersonalInfo');
    await api
      .put(updatePersonalInfoUrl)
      .send(requestBody)
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
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => UnknownError));
    const updateUserService = jest.spyOn(userService, 'updatePersonalInfo');
    await api
      .put(updatePersonalInfoUrl)
      .send(requestBody)
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
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new NotFoundException(messages.USER.NOT_FOUND)));
    const updateUserService = jest.spyOn(userService, 'updatePersonalInfo');
    await api
      .put(updatePersonalInfoUrl)
      .send(requestBody)
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
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new BadRequestException(PrismaDisconnectError.message)));
    const updateUserService = jest.spyOn(userService, 'updatePersonalInfo');
    await api
      .put(updatePersonalInfoUrl)
      .send(requestBody)
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
    const serverError = new InternalServerErrorException();
    const updateUserService = jest.spyOn(userService, 'updatePersonalInfo');
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => serverError));
    await api
      .put(updatePersonalInfoUrl)
      .send(requestBody)
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
    const updateUserService = jest.spyOn(userService, 'updatePersonalInfo');
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new BadRequestException(createMessage(messages.USER.YOUR_GENDER_INVALID))));
    await api
      .put(updatePersonalInfoUrl)
      .send(requestBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.YOUR_GENDER_INVALID));
    expect(updateUserService).toHaveBeenCalledTimes(1);
    expect(updateUserService).toHaveBeenCalledWith(userUpdate);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(updatePersonalInfoPattern, userUpdate);
  });

  it(createTestName('update personal info failed with power invalid', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const updateUserService = jest.spyOn(userService, 'updatePersonalInfo');
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new BadRequestException(createMessage(messages.USER.YOUR_POWER_INVALID))));
    await api
      .put(updatePersonalInfoUrl)
      .send(requestBody)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.YOUR_POWER_INVALID));
    expect(updateUserService).toHaveBeenCalledTimes(1);
    expect(updateUserService).toHaveBeenCalledWith(userUpdate);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(updatePersonalInfoPattern, userUpdate);
  });

  it(createTestName('update personal info failed with email was already exist', HttpStatus.UNAUTHORIZED), async () => {
    expect.hasAssertions();
    const updateUserService = jest.spyOn(userService, 'updatePersonalInfo');
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(
        throwError(() => new UnauthorizedException(createMessage(messages.USER.EMAIL_REGIS_ALREADY_EXIST))),
      );
    await api
      .put(updatePersonalInfoUrl)
      .send(requestBody)
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
    const updateUserService = jest.spyOn(userService, 'updatePersonalInfo');
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new UnauthorizedException(createMessage(messages.USER.PHONE_ALREADY_EXIST))));
    await api
      .put(updatePersonalInfoUrl)
      .send(requestBody)
      .expect(HttpStatus.UNAUTHORIZED)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.PHONE_ALREADY_EXIST));
    expect(updateUserService).toHaveBeenCalledTimes(1);
    expect(updateUserService).toHaveBeenCalledWith(userUpdate);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(updatePersonalInfoPattern, userUpdate);
  });
});

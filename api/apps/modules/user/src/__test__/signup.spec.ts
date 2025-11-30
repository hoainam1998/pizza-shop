import { RpcException } from '@nestjs/microservices';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaClient } from 'generated/prisma';
import LoggingService from '@share/libs/logging/logging.service';
import startUp from './pre-setup';
import { PRISMA_CLIENT } from '@share/di-token';
import UserController from '../user.controller';
import UserService from '../user.service';
import { user } from '@share/test/pre-setup/mock/data/user';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import { createMessage } from '@share/utils';
import messages from '@share/constants/messages';
import { PrismaDisconnectError } from '@share/test/pre-setup/mock/errors/prisma-errors';

let prismaService: PrismaClient;
let loggerService: LoggingService;
let userController: UserController;
let userService: UserService;

const userInput = {
  first_name: user.first_name,
  last_name: user.last_name,
  email: user.email,
  phone: user.phone,
  sex: user.sex,
};

beforeEach(async () => {
  const moduleRef = await startUp();

  userService = moduleRef.get(UserService);
  userController = moduleRef.get(UserController);
  loggerService = moduleRef.get(LoggingService);
  prismaService = moduleRef.get(PRISMA_CLIENT);
});

afterEach((done) => {
  jest.restoreAllMocks();
  jest.resetAllMocks();
  done();
});

describe('signup', () => {
  it('signup success', async () => {
    expect.hasAssertions();
    const create = jest.spyOn(prismaService.user, 'create').mockResolvedValue(user);
    const signupService = jest.spyOn(userService, 'signup');
    const signupController = jest.spyOn(userController, 'signup');
    await expect(userController.signup(userInput)).resolves.toBe(user);
    expect(signupController).toHaveBeenCalledTimes(1);
    expect(signupService).toHaveBeenCalledTimes(1);
    expect(signupService).toHaveBeenCalledWith(userInput);
    expect(create).toHaveBeenCalledTimes(1);
    expect(create).toHaveBeenCalledWith({
      data: userInput,
    });
  });

  it('signup failed with unknown error', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const create = jest.spyOn(prismaService.user, 'create').mockRejectedValue(UnknownError);
    const signupService = jest.spyOn(userService, 'signup');
    const signupController = jest.spyOn(userController, 'signup');
    await expect(userController.signup(userInput)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(messages.COMMON.COMMON_ERROR))),
    );
    expect(signupController).toHaveBeenCalledTimes(1);
    expect(signupService).toHaveBeenCalledTimes(1);
    expect(signupService).toHaveBeenCalledWith(userInput);
    expect(create).toHaveBeenCalledTimes(1);
    expect(create).toHaveBeenCalledWith({
      data: userInput,
    });
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(UnknownError.message, expect.any(String));
  });

  it('signup failed with database disconnect error', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const create = jest.spyOn(prismaService.user, 'create').mockRejectedValue(PrismaDisconnectError);
    const signupService = jest.spyOn(userService, 'signup');
    const signupController = jest.spyOn(userController, 'signup');
    await expect(userController.signup(userInput)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(PrismaDisconnectError.message))),
    );
    expect(signupController).toHaveBeenCalledTimes(1);
    expect(signupService).toHaveBeenCalledTimes(1);
    expect(signupService).toHaveBeenCalledWith(userInput);
    expect(create).toHaveBeenCalledTimes(1);
    expect(create).toHaveBeenCalledWith({
      data: userInput,
    });
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(PrismaDisconnectError.message, expect.any(String));
  });

  it('signup failed with sex invalid', async () => {
    expect.hasAssertions();
    const sexInvalidException = new BadRequestException(createMessage(messages.USER.YOUR_GENDER_INVALID));
    const logMethod = jest.spyOn(loggerService, 'error');
    const create = jest.spyOn(prismaService.user, 'create').mockRejectedValue(sexInvalidException);
    const signupService = jest.spyOn(userService, 'signup');
    const signupController = jest.spyOn(userController, 'signup');
    await expect(userController.signup(userInput)).rejects.toThrow(new RpcException(sexInvalidException));
    expect(signupController).toHaveBeenCalledTimes(1);
    expect(signupService).toHaveBeenCalledTimes(1);
    expect(signupService).toHaveBeenCalledWith(userInput);
    expect(create).toHaveBeenCalledTimes(1);
    expect(create).toHaveBeenCalledWith({
      data: userInput,
    });
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(messages.USER.YOUR_GENDER_INVALID, expect.any(String));
  });

  it('signup failed with power invalid', async () => {
    expect.hasAssertions();
    const powerInvalidException = new BadRequestException(createMessage(messages.USER.YOUR_POWER_INVALID));
    const logMethod = jest.spyOn(loggerService, 'error');
    const create = jest.spyOn(prismaService.user, 'create').mockRejectedValue(powerInvalidException);
    const signupService = jest.spyOn(userService, 'signup');
    const signupController = jest.spyOn(userController, 'signup');
    await expect(userController.signup(userInput)).rejects.toThrow(new RpcException(powerInvalidException));
    expect(signupController).toHaveBeenCalledTimes(1);
    expect(signupService).toHaveBeenCalledTimes(1);
    expect(signupService).toHaveBeenCalledWith(userInput);
    expect(create).toHaveBeenCalledTimes(1);
    expect(create).toHaveBeenCalledWith({
      data: userInput,
    });
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(messages.USER.YOUR_POWER_INVALID, expect.any(String));
  });

  it('signup failed with email was already exist', async () => {
    expect.hasAssertions();
    const emailExistException = new UnauthorizedException(createMessage(messages.USER.EMAIL_REGIS_ALREADY_EXIST));
    const logMethod = jest.spyOn(loggerService, 'error');
    const create = jest.spyOn(prismaService.user, 'create').mockRejectedValue(emailExistException);
    const signupService = jest.spyOn(userService, 'signup');
    const signupController = jest.spyOn(userController, 'signup');
    await expect(userController.signup(userInput)).rejects.toThrow(new RpcException(emailExistException));
    expect(signupController).toHaveBeenCalledTimes(1);
    expect(signupService).toHaveBeenCalledTimes(1);
    expect(signupService).toHaveBeenCalledWith(userInput);
    expect(create).toHaveBeenCalledTimes(1);
    expect(create).toHaveBeenCalledWith({
      data: userInput,
    });
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(messages.USER.EMAIL_REGIS_ALREADY_EXIST, expect.any(String));
  });

  it('signup failed with phone was already exist', async () => {
    expect.hasAssertions();
    const phoneExistException = new UnauthorizedException(createMessage(messages.USER.PHONE_ALREADY_EXIST));
    const logMethod = jest.spyOn(loggerService, 'error');
    const create = jest.spyOn(prismaService.user, 'create').mockRejectedValue(phoneExistException);
    const signupService = jest.spyOn(userService, 'signup');
    const signupController = jest.spyOn(userController, 'signup');
    await expect(userController.signup(userInput)).rejects.toThrow(new RpcException(phoneExistException));
    expect(signupController).toHaveBeenCalledTimes(1);
    expect(signupService).toHaveBeenCalledTimes(1);
    expect(signupService).toHaveBeenCalledWith(userInput);
    expect(create).toHaveBeenCalledTimes(1);
    expect(create).toHaveBeenCalledWith({
      data: userInput,
    });
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(messages.USER.PHONE_ALREADY_EXIST, expect.any(String));
  });
});

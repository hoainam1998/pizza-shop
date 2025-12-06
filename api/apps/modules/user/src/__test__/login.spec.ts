import { RpcException } from '@nestjs/microservices';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaClient } from 'generated/prisma';
import bcrypt from 'bcrypt';
import LoggingService from '@share/libs/logging/logging.service';
import startUp from './pre-setup';
import { PRISMA_CLIENT } from '@share/di-token';
import UserController from '../user.controller';
import UserService from '../user.service';
import { user } from '@share/test/pre-setup/mock/data/user';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import { createMessage, omitFields } from '@share/utils';
import messages from '@share/constants/messages';
import { PrismaDisconnectError, PrismaNotFoundError } from '@share/test/pre-setup/mock/errors/prisma-errors';
import { LoginInfo } from '@share/dto/validators/user.dto';

let prismaService: PrismaClient;
let loggerService: LoggingService;
let userController: UserController;
let userService: UserService;

const loginInfo: LoginInfo = {
  email: user.email,
  password: user.password,
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

describe('login', () => {
  it('login success', async () => {
    expect.hasAssertions();
    const comparePassword = jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);
    const findFirstOrThrow = jest.spyOn(prismaService.user, 'findFirstOrThrow').mockResolvedValue(user);
    const loginService = jest.spyOn(userService, 'login');
    const loginController = jest.spyOn(userController, 'login');
    await expect(userController.login(loginInfo)).resolves.toEqual(omitFields(['password'], user));
    expect(loginController).toHaveBeenCalledTimes(1);
    expect(loginService).toHaveBeenCalledTimes(1);
    expect(loginService).toHaveBeenCalledWith(loginInfo.email);
    expect(findFirstOrThrow).toHaveBeenCalledTimes(1);
    expect(findFirstOrThrow).toHaveBeenCalledWith({
      where: {
        email: loginInfo.email,
      },
      omit: {
        phone: true,
      },
    });
    expect(comparePassword).toHaveBeenCalledTimes(1);
    expect(comparePassword).toHaveBeenCalledWith(loginInfo.password, user.password);
  });

  it('login failed with unknown error', async () => {
    expect.hasAssertions();
    const comparePassword = jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);
    const logMethod = jest.spyOn(loggerService, 'error');
    const findFirstOrThrow = jest.spyOn(prismaService.user, 'findFirstOrThrow').mockRejectedValue(UnknownError);
    const loginService = jest.spyOn(userService, 'login');
    const loginController = jest.spyOn(userController, 'login');
    await expect(userController.login(loginInfo)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(messages.COMMON.COMMON_ERROR))),
    );
    expect(loginController).toHaveBeenCalledTimes(1);
    expect(loginService).toHaveBeenCalledTimes(1);
    expect(loginService).toHaveBeenCalledWith(loginInfo.email);
    expect(findFirstOrThrow).toHaveBeenCalledTimes(1);
    expect(findFirstOrThrow).toHaveBeenCalledWith({
      where: {
        email: loginInfo.email,
      },
      omit: {
        phone: true,
      },
    });
    expect(comparePassword).not.toHaveBeenCalled();
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(UnknownError.message, expect.any(String));
  });

  it('login failed with not found error', async () => {
    expect.hasAssertions();
    const comparePassword = jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);
    const logMethod = jest.spyOn(loggerService, 'error');
    const findFirstOrThrow = jest.spyOn(prismaService.user, 'findFirstOrThrow').mockRejectedValue(PrismaNotFoundError);
    const loginService = jest.spyOn(userService, 'login');
    const loginController = jest.spyOn(userController, 'login');
    await expect(userController.login(loginInfo)).rejects.toThrow(
      new RpcException(new NotFoundException(createMessage(messages.USER.NOT_FOUND))),
    );
    expect(loginController).toHaveBeenCalledTimes(1);
    expect(loginService).toHaveBeenCalledTimes(1);
    expect(loginService).toHaveBeenCalledWith(loginInfo.email);
    expect(findFirstOrThrow).toHaveBeenCalledTimes(1);
    expect(findFirstOrThrow).toHaveBeenCalledWith({
      where: {
        email: loginInfo.email,
      },
      omit: {
        phone: true,
      },
    });
    expect(comparePassword).not.toHaveBeenCalled();
    expect(logMethod).not.toHaveBeenCalled();
  });

  it('login failed with password not match', async () => {
    expect.hasAssertions();
    const comparePassword = jest.spyOn(bcrypt, 'compareSync').mockReturnValue(false);
    const logMethod = jest.spyOn(loggerService, 'error');
    const findFirstOrThrow = jest.spyOn(prismaService.user, 'findFirstOrThrow').mockResolvedValue(user as any);
    const loginService = jest.spyOn(userService, 'login');
    const loginController = jest.spyOn(userController, 'login');
    await expect(userController.login(loginInfo)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(messages.USER.PASSWORD_NOT_MATCH))),
    );
    expect(loginController).toHaveBeenCalledTimes(1);
    expect(loginService).toHaveBeenCalledTimes(1);
    expect(loginService).toHaveBeenCalledWith(loginInfo.email);
    expect(findFirstOrThrow).toHaveBeenCalledTimes(1);
    expect(findFirstOrThrow).toHaveBeenCalledWith({
      where: {
        email: loginInfo.email,
      },
      omit: {
        phone: true,
      },
    });
    expect(comparePassword).toHaveBeenCalledTimes(1);
    expect(comparePassword).toHaveBeenCalledWith(loginInfo.password, user.password);
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(messages.USER.PASSWORD_NOT_MATCH, expect.any(String));
  });

  it('login failed with database disconnect error', async () => {
    expect.hasAssertions();
    const comparePassword = jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);
    const logMethod = jest.spyOn(loggerService, 'error');
    const findFirstOrThrow = jest
      .spyOn(prismaService.user, 'findFirstOrThrow')
      .mockRejectedValue(PrismaDisconnectError);
    const loginService = jest.spyOn(userService, 'login');
    const loginController = jest.spyOn(userController, 'login');
    await expect(userController.login(loginInfo)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(PrismaDisconnectError.message))),
    );
    expect(loginController).toHaveBeenCalledTimes(1);
    expect(loginService).toHaveBeenCalledTimes(1);
    expect(loginService).toHaveBeenCalledWith(loginInfo.email);
    expect(findFirstOrThrow).toHaveBeenCalledTimes(1);
    expect(findFirstOrThrow).toHaveBeenCalledWith({
      where: {
        email: loginInfo.email,
      },
      omit: {
        phone: true,
      },
    });
    expect(comparePassword).not.toHaveBeenCalled();
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(PrismaDisconnectError.message, expect.any(String));
  });
});

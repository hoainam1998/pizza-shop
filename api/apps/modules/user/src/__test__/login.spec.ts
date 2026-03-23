import { RpcException } from '@nestjs/microservices';
import { BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import bcrypt from 'bcrypt';
import LoggingService from '@share/libs/logging/logging.service';
import startUp from './pre-setup';
import UserController from '../user.controller';
import UserService from '../user.service';
import { user } from '@share/test/pre-setup/mock/data/user';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import { createMessage, omitFields, autoGeneratePassword } from '@share/utils';
import messages from '@share/constants/messages';
import { PrismaDisconnectError } from '@share/test/pre-setup/mock/errors/prisma-errors';
import { LoginInfo } from '@share/dto/validators/user.dto';

let loggerService: LoggingService;
let userController: UserController;
let userService: UserService;

const loginInfo: LoginInfo = {
  email: user.email,
  password: user.password,
  session_id: autoGeneratePassword(),
};

beforeAll(async () => {
  const moduleRef = await startUp();
  userService = moduleRef.get(UserService);
  userController = moduleRef.get(UserController);
  loggerService = moduleRef.get(LoggingService);
});

describe('login', () => {
  it('login success', async () => {
    expect.hasAssertions();
    const comparePassword = jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);
    const checkSessionIdExist = jest.spyOn(userService, 'checkSessionIdExist').mockResolvedValue(false);
    const login = jest.spyOn(userService, 'login').mockResolvedValue(user);
    const updateUserSessionId = jest.spyOn(userService, 'updateUserSessionId').mockResolvedValue(user);
    const loginController = jest.spyOn(userController, 'login');
    await expect(userController.login(loginInfo)).resolves.toEqual(omitFields(['password', 'session_id'], user));
    expect(loginController).toHaveBeenCalledTimes(1);
    expect(checkSessionIdExist).toHaveBeenCalledTimes(1);
    expect(checkSessionIdExist).toHaveBeenCalledWith(loginInfo.session_id);
    expect(login).toHaveBeenCalledTimes(1);
    expect(login).toHaveBeenCalledWith(loginInfo.email);
    expect(updateUserSessionId).toHaveBeenCalledTimes(1);
    expect(updateUserSessionId).toHaveBeenCalledWith(user.user_id, loginInfo.session_id);
    expect(comparePassword).toHaveBeenCalledTimes(1);
    expect(comparePassword).toHaveBeenCalledWith(loginInfo.password, user.password);
  });

  it('login failed with checkSessionIdExist got unknown error', async () => {
    expect.hasAssertions();
    const comparePassword = jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);
    const logMethod = jest.spyOn(loggerService, 'error');
    const checkSessionIdExist = jest.spyOn(userService, 'checkSessionIdExist').mockRejectedValue(UnknownError);
    const login = jest.spyOn(userService, 'login');
    const updateUserSessionId = jest.spyOn(userService, 'updateUserSessionId');
    const loginController = jest.spyOn(userController, 'login');
    await expect(userController.login(loginInfo)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(messages.COMMON.COMMON_ERROR))),
    );
    expect(loginController).toHaveBeenCalledTimes(1);
    expect(checkSessionIdExist).toHaveBeenCalledTimes(1);
    expect(checkSessionIdExist).toHaveBeenCalledWith(loginInfo.session_id);
    expect(login).not.toHaveBeenCalled();
    expect(updateUserSessionId).not.toHaveBeenCalled();
    expect(comparePassword).not.toHaveBeenCalled();
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(UnknownError.message, expect.any(String));
  });

  it('login failed with login got unknown error', async () => {
    expect.hasAssertions();
    const comparePassword = jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);
    const logMethod = jest.spyOn(loggerService, 'error');
    const checkSessionIdExist = jest.spyOn(userService, 'checkSessionIdExist').mockResolvedValue(false);
    const login = jest.spyOn(userService, 'login').mockRejectedValue(UnknownError);
    const updateUserSessionId = jest.spyOn(userService, 'updateUserSessionId');
    const loginController = jest.spyOn(userController, 'login');
    await expect(userController.login(loginInfo)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(messages.COMMON.COMMON_ERROR))),
    );
    expect(loginController).toHaveBeenCalledTimes(1);
    expect(checkSessionIdExist).toHaveBeenCalledTimes(1);
    expect(checkSessionIdExist).toHaveBeenCalledWith(loginInfo.session_id);
    expect(login).toHaveBeenCalledTimes(1);
    expect(login).toHaveBeenCalledWith(loginInfo.email);
    expect(updateUserSessionId).not.toHaveBeenCalled();
    expect(comparePassword).not.toHaveBeenCalled();
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(UnknownError.message, expect.any(String));
  });

  it('login failed with updateUserSessionId got unknown error', async () => {
    expect.hasAssertions();
    const comparePassword = jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);
    const logMethod = jest.spyOn(loggerService, 'error');
    const checkSessionIdExist = jest.spyOn(userService, 'checkSessionIdExist').mockResolvedValue(false);
    const login = jest.spyOn(userService, 'login').mockResolvedValue(user);
    const updateUserSessionId = jest.spyOn(userService, 'updateUserSessionId').mockRejectedValue(UnknownError);
    const loginController = jest.spyOn(userController, 'login');
    await expect(userController.login(loginInfo)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(messages.COMMON.COMMON_ERROR))),
    );
    expect(loginController).toHaveBeenCalledTimes(1);
    expect(checkSessionIdExist).toHaveBeenCalledTimes(1);
    expect(checkSessionIdExist).toHaveBeenCalledWith(loginInfo.session_id);
    expect(login).toHaveBeenCalledTimes(1);
    expect(login).toHaveBeenCalledWith(loginInfo.email);
    expect(updateUserSessionId).toHaveBeenCalledTimes(1);
    expect(updateUserSessionId).toHaveBeenCalledWith(user.user_id, loginInfo.session_id);
    expect(comparePassword).toHaveBeenCalledTimes(1);
    expect(comparePassword).toHaveBeenCalledWith(loginInfo.password, user.password);
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(UnknownError.message, expect.any(String));
  });

  it('login failed with login got not found error', async () => {
    expect.hasAssertions();
    const checkSessionIdExist = jest.spyOn(userService, 'checkSessionIdExist').mockResolvedValue(false);
    const comparePassword = jest.spyOn(bcrypt, 'compareSync');
    const login = jest
      .spyOn(userService, 'login')
      .mockRejectedValue(new RpcException(new NotFoundException(messages.USER.NOT_FOUND)));
    const updateUserSessionId = jest.spyOn(userService, 'updateUserSessionId');
    const logMethod = jest.spyOn(loggerService, 'error');
    await expect(userController.login(loginInfo)).rejects.toThrow(
      new RpcException(new NotFoundException(createMessage(messages.USER.NOT_FOUND))),
    );
    expect(checkSessionIdExist).toHaveBeenCalledTimes(1);
    expect(checkSessionIdExist).toHaveBeenCalledWith(loginInfo.session_id);
    expect(login).toHaveBeenCalledTimes(1);
    expect(login).toHaveBeenCalledWith(loginInfo.email);
    expect(updateUserSessionId).not.toHaveBeenCalled();
    expect(comparePassword).not.toHaveBeenCalled();
    expect(logMethod).not.toHaveBeenCalled();
  });

  it('login failed with updateUserSessionId got not found error', async () => {
    expect.hasAssertions();
    const checkSessionIdExist = jest.spyOn(userService, 'checkSessionIdExist').mockResolvedValue(false);
    const comparePassword = jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);
    const login = jest.spyOn(userService, 'login').mockResolvedValue(user);
    const updateUserSessionId = jest
      .spyOn(userService, 'updateUserSessionId')
      .mockRejectedValue(new RpcException(new NotFoundException(messages.USER.NOT_FOUND)));
    const logMethod = jest.spyOn(loggerService, 'error');
    await expect(userController.login(loginInfo)).rejects.toThrow(
      new RpcException(new NotFoundException(createMessage(messages.USER.NOT_FOUND))),
    );
    expect(checkSessionIdExist).toHaveBeenCalledTimes(1);
    expect(checkSessionIdExist).toHaveBeenCalledWith(loginInfo.session_id);
    expect(login).toHaveBeenCalledTimes(1);
    expect(login).toHaveBeenCalledWith(loginInfo.email);
    expect(updateUserSessionId).toHaveBeenCalledTimes(1);
    expect(updateUserSessionId).toHaveBeenCalledWith(user.user_id, loginInfo.session_id);
    expect(comparePassword).toHaveBeenCalledTimes(1);
    expect(comparePassword).toHaveBeenCalledWith(loginInfo.password, user.password);
    expect(logMethod).not.toHaveBeenCalled();
  });

  it('login failed with password not match', async () => {
    expect.hasAssertions();
    const checkSessionIdExist = jest.spyOn(userService, 'checkSessionIdExist').mockResolvedValue(false);
    const comparePassword = jest.spyOn(bcrypt, 'compareSync').mockReturnValue(false);
    const updateUserSessionId = jest.spyOn(userService, 'updateUserSessionId');
    const logMethod = jest.spyOn(loggerService, 'error');
    const login = jest.spyOn(userService, 'login').mockResolvedValue(user);
    const loginController = jest.spyOn(userController, 'login');
    await expect(userController.login(loginInfo)).rejects.toThrow(
      new RpcException(new UnauthorizedException(createMessage(messages.USER.PASSWORD_NOT_MATCH))),
    );
    expect(loginController).toHaveBeenCalledTimes(1);
    expect(checkSessionIdExist).toHaveBeenCalledTimes(1);
    expect(checkSessionIdExist).toHaveBeenCalledWith(loginInfo.session_id);
    expect(login).toHaveBeenCalledTimes(1);
    expect(login).toHaveBeenCalledWith(loginInfo.email);
    expect(comparePassword).toHaveBeenCalledTimes(1);
    expect(comparePassword).toHaveBeenCalledWith(loginInfo.password, user.password);
    expect(updateUserSessionId).not.toHaveBeenCalled();
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(messages.USER.PASSWORD_NOT_MATCH, expect.any(String));
  });

  it('login failed with login got database disconnect error', async () => {
    expect.hasAssertions();
    const checkSessionIdExist = jest.spyOn(userService, 'checkSessionIdExist').mockResolvedValue(false);
    const comparePassword = jest.spyOn(bcrypt, 'compareSync').mockReturnValue(false);
    const updateUserSessionId = jest.spyOn(userService, 'updateUserSessionId');
    const logMethod = jest.spyOn(loggerService, 'error');
    const login = jest
      .spyOn(userService, 'login')
      .mockRejectedValue(new RpcException(new BadRequestException(PrismaDisconnectError.message)));
    const loginController = jest.spyOn(userController, 'login');
    await expect(userController.login(loginInfo)).rejects.toThrow(
      new RpcException(new UnauthorizedException(createMessage(PrismaDisconnectError.message))),
    );
    expect(loginController).toHaveBeenCalledTimes(1);
    expect(checkSessionIdExist).toHaveBeenCalledTimes(1);
    expect(checkSessionIdExist).toHaveBeenCalledWith(loginInfo.session_id);
    expect(login).toHaveBeenCalledTimes(1);
    expect(login).toHaveBeenCalledWith(loginInfo.email);
    expect(comparePassword).not.toHaveBeenCalled();
    expect(updateUserSessionId).not.toHaveBeenCalled();
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(PrismaDisconnectError.message, expect.any(String));
  });

  it('login failed with updateUserSessionId got database disconnect error', async () => {
    expect.hasAssertions();
    const checkSessionIdExist = jest.spyOn(userService, 'checkSessionIdExist').mockResolvedValue(false);
    const comparePassword = jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);
    const updateUserSessionId = jest
      .spyOn(userService, 'updateUserSessionId')
      .mockRejectedValue(new RpcException(new BadRequestException(PrismaDisconnectError.message)));
    const logMethod = jest.spyOn(loggerService, 'error');
    const login = jest.spyOn(userService, 'login').mockResolvedValue(user);
    const loginController = jest.spyOn(userController, 'login');
    await expect(userController.login(loginInfo)).rejects.toThrow(
      new RpcException(new UnauthorizedException(createMessage(PrismaDisconnectError.message))),
    );
    expect(loginController).toHaveBeenCalledTimes(1);
    expect(checkSessionIdExist).toHaveBeenCalledTimes(1);
    expect(checkSessionIdExist).toHaveBeenCalledWith(loginInfo.session_id);
    expect(login).toHaveBeenCalledTimes(1);
    expect(login).toHaveBeenCalledWith(loginInfo.email);
    expect(updateUserSessionId).toHaveBeenCalledTimes(1);
    expect(updateUserSessionId).toHaveBeenCalledWith(user.user_id, loginInfo.session_id);
    expect(comparePassword).toHaveBeenCalledTimes(1);
    expect(comparePassword).toHaveBeenCalledWith(loginInfo.password, user.password);
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(PrismaDisconnectError.message, expect.any(String));
  });
});

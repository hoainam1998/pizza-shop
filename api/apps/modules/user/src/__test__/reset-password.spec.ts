import { RpcException } from '@nestjs/microservices';
import { BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import LoggingService from '@share/libs/logging/logging.service';
import startUp from './pre-setup';
import UserController from '../user.controller';
import UserService from '../user.service';
import { user } from '@share/test/pre-setup/mock/data/user';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import {
  JsonWebTokenUnknownError,
  JsonWebTokenExpiredError,
  JsonWebTokenMalformedError,
} from '@share/test/pre-setup/mock/errors/jwt';
import { createMessage, autoGeneratePassword } from '@share/utils';
import messages from '@share/constants/messages';
import { PrismaDisconnectError } from '@share/test/pre-setup/mock/errors/prisma-errors';
import { ResetPassword } from '@share/dto/validators/user.dto';
import { APP_NAME, POWER_NUMERIC } from '@share/enums';

let loggerService: LoggingService;
let userController: UserController;
let userService: UserService;

const oldPassword = autoGeneratePassword();
const resetPasswordBody: ResetPassword = {
  email: user.email,
  password: user.password,
  oldPassword,
  token: user.reset_password_token,
  by: APP_NAME.ADMIN,
};

const jwtPayload: jwt.JwtPayload = {
  email: user.email,
  password: oldPassword,
};

const getUserParameters = { password: true, power: true };

beforeAll(async () => {
  const moduleRef = await startUp();
  userService = moduleRef.get(UserService);
  userController = moduleRef.get(UserController);
  loggerService = moduleRef.get(LoggingService);
});

describe('reset password', () => {
  it('reset password success', async () => {
    expect.hasAssertions();
    const verify = jest.spyOn(jwt, 'verify').mockReturnValue(jwtPayload as any);
    const compareSync = jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);
    const getUserService = jest.spyOn(userService, 'getUser').mockResolvedValue(user);
    const resetPasswordService = jest.spyOn(userService, 'resetPassword').mockResolvedValue(user);
    const resetPasswordController = jest.spyOn(userController, 'resetPassword');
    await expect(userController.resetPassword(resetPasswordBody)).resolves.toBe(user);
    expect(resetPasswordController).toHaveBeenCalledTimes(1);
    expect(verify).toHaveBeenCalledTimes(1);
    expect(verify).toHaveBeenCalledWith(resetPasswordBody.token, process.env.ADMIN_RESET_PASSWORD_SECRET_KEY);
    expect(getUserService).toHaveBeenCalledTimes(1);
    expect(getUserService).toHaveBeenCalledWith({ email: resetPasswordBody.email }, getUserParameters);
    expect(compareSync).toHaveBeenCalledTimes(1);
    expect(compareSync).toHaveBeenCalledWith(resetPasswordBody.oldPassword, user.password);
    expect(resetPasswordService).toHaveBeenCalledTimes(1);
    expect(resetPasswordService).toHaveBeenCalledWith(resetPasswordBody);
  });

  it('reset password failed with sale view and admin role', async () => {
    expect.hasAssertions();
    const resetPasswordBodyWithSale = { ...resetPasswordBody, by: APP_NAME.SALE };
    const userWithAdminRole = { ...user, power: POWER_NUMERIC.ADMIN };
    const verify = jest.spyOn(jwt, 'verify').mockReturnValue(jwtPayload as any);
    const compareSync = jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);
    const getUserService = jest.spyOn(userService, 'getUser').mockResolvedValue(userWithAdminRole);
    const resetPasswordService = jest.spyOn(userService, 'resetPassword');
    const resetPasswordController = jest.spyOn(userController, 'resetPassword');
    await expect(userController.resetPassword(resetPasswordBodyWithSale)).rejects.toThrow(
      new RpcException(new UnauthorizedException(createMessage(messages.USER.NOT_ALLOW_ADMIN_LOGIN))),
    );
    expect(resetPasswordController).toHaveBeenCalledTimes(1);
    expect(verify).toHaveBeenCalledTimes(1);
    expect(verify).toHaveBeenCalledWith(resetPasswordBodyWithSale.token, process.env.ADMIN_RESET_PASSWORD_SECRET_KEY);
    expect(getUserService).toHaveBeenCalledTimes(1);
    expect(getUserService).toHaveBeenCalledWith({ email: resetPasswordBodyWithSale.email }, getUserParameters);
    expect(compareSync).not.toHaveBeenCalled();
    expect(resetPasswordService).not.toHaveBeenCalled();
  });

  it('reset password failed with admin view and sale role', async () => {
    expect.hasAssertions();
    const resetPasswordBodyWithAdmin = { ...resetPasswordBody, by: APP_NAME.ADMIN };
    const userWithSaleRole = { ...user, power: POWER_NUMERIC.SALE };
    const verify = jest.spyOn(jwt, 'verify').mockReturnValue(jwtPayload as any);
    const compareSync = jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);
    const getUserService = jest.spyOn(userService, 'getUser').mockResolvedValue(userWithSaleRole);
    const resetPasswordService = jest.spyOn(userService, 'resetPassword');
    const resetPasswordController = jest.spyOn(userController, 'resetPassword');
    await expect(userController.resetPassword(resetPasswordBodyWithAdmin)).rejects.toThrow(
      new RpcException(new UnauthorizedException(createMessage(messages.USER.NOT_ALLOW_SALE_LOGIN))),
    );
    expect(resetPasswordController).toHaveBeenCalledTimes(1);
    expect(verify).toHaveBeenCalledTimes(1);
    expect(verify).toHaveBeenCalledWith(resetPasswordBodyWithAdmin.token, process.env.ADMIN_RESET_PASSWORD_SECRET_KEY);
    expect(getUserService).toHaveBeenCalledTimes(1);
    expect(getUserService).toHaveBeenCalledWith({ email: resetPasswordBodyWithAdmin.email }, getUserParameters);
    expect(compareSync).not.toHaveBeenCalled();
    expect(resetPasswordService).not.toHaveBeenCalled();
  });

  it('reset password failed when unknown resource', async () => {
    expect.hasAssertions();
    const resetPasswordBodyWithUnknownResource = { ...resetPasswordBody, by: undefined };
    const userWithSaleRole = { ...user, power: POWER_NUMERIC.SALE };
    const verify = jest.spyOn(jwt, 'verify').mockReturnValue(jwtPayload as any);
    const compareSync = jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);
    const getUserService = jest.spyOn(userService, 'getUser').mockResolvedValue(userWithSaleRole);
    const resetPasswordService = jest.spyOn(userService, 'resetPassword');
    const resetPasswordController = jest.spyOn(userController, 'resetPassword');
    await expect(userController.resetPassword(resetPasswordBodyWithUnknownResource)).rejects.toThrow(
      new RpcException(new UnauthorizedException(createMessage(messages.COMMON.UNKNOWN_RESOURCE))),
    );
    expect(resetPasswordController).toHaveBeenCalledTimes(1);
    expect(verify).toHaveBeenCalledTimes(1);
    expect(verify).toHaveBeenCalledWith(
      resetPasswordBodyWithUnknownResource.token,
      process.env.ADMIN_RESET_PASSWORD_SECRET_KEY,
    );
    expect(getUserService).toHaveBeenCalledTimes(1);
    expect(getUserService).toHaveBeenCalledWith(
      { email: resetPasswordBodyWithUnknownResource.email },
      getUserParameters,
    );
    expect(compareSync).not.toHaveBeenCalled();
    expect(resetPasswordService).not.toHaveBeenCalled();
  });

  it('reset password failed with jwt verify got unknown error', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const verify = jest.spyOn(jwt, 'verify').mockImplementation(() => {
      throw JsonWebTokenUnknownError;
    });
    const compareSync = jest.spyOn(bcrypt, 'compareSync');
    const getUserService = jest.spyOn(userService, 'getUser');
    const resetPasswordService = jest.spyOn(userService, 'resetPassword');
    const resetPasswordController = jest.spyOn(userController, 'resetPassword');
    await expect(userController.resetPassword(resetPasswordBody)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(messages.JWT.UNKNOWN))),
    );
    expect(resetPasswordController).toHaveBeenCalledTimes(1);
    expect(verify).toHaveBeenCalledTimes(1);
    expect(verify).toHaveBeenCalledWith(resetPasswordBody.token, process.env.ADMIN_RESET_PASSWORD_SECRET_KEY);
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(messages.JWT.UNKNOWN, expect.any(String));
    expect(resetPasswordService).not.toHaveBeenCalled();
    expect(compareSync).not.toHaveBeenCalled();
    expect(getUserService).not.toHaveBeenCalled();
  });

  it('reset password failed with jwt verify got token expired error', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const verify = jest.spyOn(jwt, 'verify').mockImplementation(() => {
      throw JsonWebTokenExpiredError;
    });
    const compareSync = jest.spyOn(bcrypt, 'compareSync');
    const getUserService = jest.spyOn(userService, 'getUser');
    const resetPasswordService = jest.spyOn(userService, 'resetPassword');
    const resetPasswordController = jest.spyOn(userController, 'resetPassword');
    await expect(userController.resetPassword(resetPasswordBody)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(messages.JWT.EXPIRED))),
    );
    expect(resetPasswordController).toHaveBeenCalledTimes(1);
    expect(verify).toHaveBeenCalledTimes(1);
    expect(verify).toHaveBeenCalledWith(resetPasswordBody.token, process.env.ADMIN_RESET_PASSWORD_SECRET_KEY);
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(messages.JWT.EXPIRED, expect.any(String));
    expect(resetPasswordService).not.toHaveBeenCalled();
    expect(getUserService).not.toHaveBeenCalled();
    expect(compareSync).not.toHaveBeenCalled();
  });

  it('reset password failed with jwt verify got malformed error', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const verify = jest.spyOn(jwt, 'verify').mockImplementation(() => {
      throw JsonWebTokenMalformedError;
    });
    const compareSync = jest.spyOn(bcrypt, 'compareSync');
    const getUserService = jest.spyOn(userService, 'getUser');
    const resetPasswordService = jest.spyOn(userService, 'resetPassword');
    const resetPasswordController = jest.spyOn(userController, 'resetPassword');
    await expect(userController.resetPassword(resetPasswordBody)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(messages.JWT.MALFORMED))),
    );
    expect(resetPasswordController).toHaveBeenCalledTimes(1);
    expect(verify).toHaveBeenCalledTimes(1);
    expect(verify).toHaveBeenCalledWith(resetPasswordBody.token, process.env.ADMIN_RESET_PASSWORD_SECRET_KEY);
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(messages.JWT.MALFORMED, expect.any(String));
    expect(resetPasswordService).not.toHaveBeenCalled();
    expect(getUserService).not.toHaveBeenCalled();
    expect(compareSync).not.toHaveBeenCalled();
  });

  it('reset password failed with jwt verify result is null', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const verify = jest.spyOn(jwt, 'verify').mockReturnValue(null as any);
    const compareSync = jest.spyOn(bcrypt, 'compareSync');
    const getUserService = jest.spyOn(userService, 'getUser');
    const resetPasswordService = jest.spyOn(userService, 'resetPassword');
    const resetPasswordController = jest.spyOn(userController, 'resetPassword');
    await expect(userController.resetPassword(resetPasswordBody)).rejects.toThrow(
      new RpcException(new UnauthorizedException(createMessage(messages.USER.NOT_FOUND))),
    );
    expect(resetPasswordController).toHaveBeenCalledTimes(1);
    expect(verify).toHaveBeenCalledTimes(1);
    expect(verify).toHaveBeenCalledWith(resetPasswordBody.token, process.env.ADMIN_RESET_PASSWORD_SECRET_KEY);
    expect(resetPasswordService).not.toHaveBeenCalled();
    expect(getUserService).not.toHaveBeenCalled();
    expect(compareSync).not.toHaveBeenCalled();
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenLastCalledWith(messages.USER.NOT_FOUND, expect.any(String));
  });

  it('reset password failed with jwt verify result is not same with user info', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const verify = jest.spyOn(jwt, 'verify').mockReturnValue({ ...jwtPayload, email: 'anotherEmail@gmail.com' } as any);
    const compareSync = jest.spyOn(bcrypt, 'compareSync');
    const getUserService = jest.spyOn(userService, 'getUser');
    const resetPasswordService = jest.spyOn(userService, 'resetPassword');
    const resetPasswordController = jest.spyOn(userController, 'resetPassword');
    await expect(userController.resetPassword(resetPasswordBody)).rejects.toThrow(
      new RpcException(new UnauthorizedException(createMessage(messages.USER.NOT_FOUND))),
    );
    expect(resetPasswordController).toHaveBeenCalledTimes(1);
    expect(verify).toHaveBeenCalledTimes(1);
    expect(verify).toHaveBeenCalledWith(resetPasswordBody.token, process.env.ADMIN_RESET_PASSWORD_SECRET_KEY);
    expect(resetPasswordService).not.toHaveBeenCalled();
    expect(getUserService).not.toHaveBeenCalled();
    expect(compareSync).not.toHaveBeenCalled();
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenLastCalledWith(messages.USER.NOT_FOUND, expect.any(String));
  });

  it('reset password failed with getUser got not found error', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const verify = jest.spyOn(jwt, 'verify').mockReturnValue(jwtPayload as any);
    const compareSync = jest.spyOn(bcrypt, 'compareSync');
    const getUserService = jest
      .spyOn(userService, 'getUser')
      .mockRejectedValue(new RpcException(new NotFoundException(messages.USER.NOT_FOUND)));
    const resetPasswordService = jest.spyOn(userService, 'resetPassword');
    const resetPasswordController = jest.spyOn(userController, 'resetPassword');
    await expect(userController.resetPassword(resetPasswordBody)).rejects.toThrow(
      new RpcException(new NotFoundException(messages.USER.NOT_FOUND)),
    );
    expect(resetPasswordController).toHaveBeenCalledTimes(1);
    expect(verify).toHaveBeenCalledTimes(1);
    expect(verify).toHaveBeenCalledWith(resetPasswordBody.token, process.env.ADMIN_RESET_PASSWORD_SECRET_KEY);
    expect(getUserService).toHaveBeenCalledTimes(1);
    expect(getUserService).toHaveBeenCalledWith({ email: resetPasswordBody.email }, getUserParameters);
    expect(resetPasswordService).not.toHaveBeenCalled();
    expect(compareSync).not.toHaveBeenCalled();
    expect(logMethod).not.toHaveBeenCalled();
  });

  it('reset password failed with getUser got unknown error', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const verify = jest.spyOn(jwt, 'verify').mockReturnValue(jwtPayload as any);
    const compareSync = jest.spyOn(bcrypt, 'compareSync');
    const getUserService = jest.spyOn(userService, 'getUser').mockRejectedValue(UnknownError);
    const resetPasswordService = jest.spyOn(userService, 'resetPassword');
    const resetPasswordController = jest.spyOn(userController, 'resetPassword');
    await expect(userController.resetPassword(resetPasswordBody)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(messages.COMMON.COMMON_ERROR))),
    );
    expect(resetPasswordController).toHaveBeenCalledTimes(1);
    expect(verify).toHaveBeenCalledTimes(1);
    expect(verify).toHaveBeenCalledWith(resetPasswordBody.token, process.env.ADMIN_RESET_PASSWORD_SECRET_KEY);
    expect(getUserService).toHaveBeenCalledTimes(1);
    expect(getUserService).toHaveBeenCalledWith({ email: resetPasswordBody.email }, getUserParameters);
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenLastCalledWith(UnknownError.message, expect.any(String));
    expect(resetPasswordService).not.toHaveBeenCalled();
    expect(compareSync).not.toHaveBeenCalled();
  });

  it('reset password failed with getUser got database disconnect error', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const verify = jest.spyOn(jwt, 'verify').mockReturnValue(jwtPayload as any);
    const compareSync = jest.spyOn(bcrypt, 'compareSync');
    const getUserService = jest
      .spyOn(userService, 'getUser')
      .mockRejectedValue(new RpcException(new BadRequestException(PrismaDisconnectError.message)));
    const resetPasswordService = jest.spyOn(userService, 'resetPassword');
    const resetPasswordController = jest.spyOn(userController, 'resetPassword');
    await expect(userController.resetPassword(resetPasswordBody)).rejects.toThrow(
      new RpcException(new BadRequestException(PrismaDisconnectError.message)),
    );
    expect(resetPasswordController).toHaveBeenCalledTimes(1);
    expect(verify).toHaveBeenCalledTimes(1);
    expect(verify).toHaveBeenCalledWith(resetPasswordBody.token, process.env.ADMIN_RESET_PASSWORD_SECRET_KEY);
    expect(getUserService).toHaveBeenCalledTimes(1);
    expect(getUserService).toHaveBeenCalledWith({ email: resetPasswordBody.email }, getUserParameters);
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenLastCalledWith(PrismaDisconnectError.message, expect.any(String));
    expect(resetPasswordService).not.toHaveBeenCalled();
    expect(compareSync).not.toHaveBeenCalled();
  });

  it('reset password failed with comparePassword got unknown error', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const verify = jest.spyOn(jwt, 'verify').mockReturnValue(jwtPayload as any);
    const compareSync = jest.spyOn(bcrypt, 'compareSync').mockImplementation(() => {
      throw UnknownError;
    });
    const getUserService = jest.spyOn(userService, 'getUser').mockResolvedValue(user);
    const resetPasswordService = jest.spyOn(userService, 'resetPassword');
    const resetPasswordController = jest.spyOn(userController, 'resetPassword');
    await expect(userController.resetPassword(resetPasswordBody)).rejects.toThrow(
      new RpcException(new BadRequestException(messages.COMMON.COMMON_ERROR)),
    );
    expect(resetPasswordController).toHaveBeenCalledTimes(1);
    expect(verify).toHaveBeenCalledTimes(1);
    expect(verify).toHaveBeenCalledWith(resetPasswordBody.token, process.env.ADMIN_RESET_PASSWORD_SECRET_KEY);
    expect(getUserService).toHaveBeenCalledTimes(1);
    expect(getUserService).toHaveBeenCalledWith({ email: resetPasswordBody.email }, getUserParameters);
    expect(compareSync).toHaveBeenCalledTimes(1);
    expect(compareSync).toHaveBeenCalledWith(resetPasswordBody.oldPassword, user.password);
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenLastCalledWith(UnknownError.message, expect.any(String));
    expect(resetPasswordService).not.toHaveBeenCalled();
  });

  it('reset password failed with comparePassword return false', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const verify = jest.spyOn(jwt, 'verify').mockReturnValue(jwtPayload as any);
    const compareSync = jest.spyOn(bcrypt, 'compareSync').mockReturnValue(false);
    const getUserService = jest.spyOn(userService, 'getUser').mockResolvedValue(user);
    const resetPasswordService = jest.spyOn(userService, 'resetPassword');
    const resetPasswordController = jest.spyOn(userController, 'resetPassword');
    await expect(userController.resetPassword(resetPasswordBody)).rejects.toThrow(
      new RpcException(new UnauthorizedException(createMessage(messages.USER.PASSWORD_NOT_MATCH))),
    );
    expect(resetPasswordController).toHaveBeenCalledTimes(1);
    expect(verify).toHaveBeenCalledTimes(1);
    expect(verify).toHaveBeenCalledWith(resetPasswordBody.token, process.env.ADMIN_RESET_PASSWORD_SECRET_KEY);
    expect(getUserService).toHaveBeenCalledTimes(1);
    expect(getUserService).toHaveBeenCalledWith({ email: resetPasswordBody.email }, getUserParameters);
    expect(compareSync).toHaveBeenCalledTimes(1);
    expect(compareSync).toHaveBeenCalledWith(resetPasswordBody.oldPassword, user.password);
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenLastCalledWith(messages.USER.PASSWORD_NOT_MATCH, expect.any(String));
    expect(resetPasswordService).not.toHaveBeenCalled();
  });

  it('reset password failed when resetPassword method got unknown error', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const verify = jest.spyOn(jwt, 'verify').mockReturnValue(jwtPayload as any);
    const compareSync = jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);
    const getUserService = jest.spyOn(userService, 'getUser').mockResolvedValue(user);
    const resetPasswordService = jest.spyOn(userService, 'resetPassword').mockRejectedValue(UnknownError);
    const resetPasswordController = jest.spyOn(userController, 'resetPassword');
    await expect(userController.resetPassword(resetPasswordBody)).rejects.toThrow(
      new RpcException(new BadRequestException(messages.COMMON.COMMON_ERROR)),
    );
    expect(resetPasswordController).toHaveBeenCalledTimes(1);
    expect(verify).toHaveBeenCalledTimes(1);
    expect(verify).toHaveBeenCalledWith(resetPasswordBody.token, process.env.ADMIN_RESET_PASSWORD_SECRET_KEY);
    expect(getUserService).toHaveBeenCalledTimes(1);
    expect(getUserService).toHaveBeenCalledWith({ email: resetPasswordBody.email }, getUserParameters);
    expect(compareSync).toHaveBeenCalledTimes(1);
    expect(compareSync).toHaveBeenCalledWith(resetPasswordBody.oldPassword, user.password);
    expect(resetPasswordService).toHaveBeenCalledTimes(1);
    expect(resetPasswordService).toHaveBeenCalledWith(resetPasswordBody);
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenLastCalledWith(UnknownError.message, expect.any(String));
  });

  it('reset password failed when resetPassword method got not found error', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const verify = jest.spyOn(jwt, 'verify').mockReturnValue(jwtPayload as any);
    const compareSync = jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);
    const getUserService = jest.spyOn(userService, 'getUser').mockResolvedValue(user);
    const resetPasswordService = jest
      .spyOn(userService, 'resetPassword')
      .mockRejectedValue(new RpcException(new UnauthorizedException(messages.USER.NOT_FOUND)));
    const resetPasswordController = jest.spyOn(userController, 'resetPassword');
    await expect(userController.resetPassword(resetPasswordBody)).rejects.toThrow(
      new RpcException(new UnauthorizedException(messages.USER.NOT_FOUND)),
    );
    expect(resetPasswordController).toHaveBeenCalledTimes(1);
    expect(verify).toHaveBeenCalledTimes(1);
    expect(verify).toHaveBeenCalledWith(resetPasswordBody.token, process.env.ADMIN_RESET_PASSWORD_SECRET_KEY);
    expect(getUserService).toHaveBeenCalledTimes(1);
    expect(getUserService).toHaveBeenCalledWith({ email: resetPasswordBody.email }, getUserParameters);
    expect(compareSync).toHaveBeenCalledTimes(1);
    expect(compareSync).toHaveBeenCalledWith(resetPasswordBody.oldPassword, user.password);
    expect(resetPasswordService).toHaveBeenCalledTimes(1);
    expect(resetPasswordService).toHaveBeenCalledWith(resetPasswordBody);
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(messages.USER.NOT_FOUND, expect.any(String));
  });

  it('reset password failed when resetPassword method got database disconnect error', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const verify = jest.spyOn(jwt, 'verify').mockReturnValue(jwtPayload as any);
    const compareSync = jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);
    const getUserService = jest.spyOn(userService, 'getUser').mockResolvedValue(user);
    const resetPasswordService = jest
      .spyOn(userService, 'resetPassword')
      .mockRejectedValue(new RpcException(new BadRequestException(PrismaDisconnectError.message)));
    const resetPasswordController = jest.spyOn(userController, 'resetPassword');
    await expect(userController.resetPassword(resetPasswordBody)).rejects.toThrow(
      new RpcException(new BadRequestException(PrismaDisconnectError.message)),
    );
    expect(resetPasswordController).toHaveBeenCalledTimes(1);
    expect(verify).toHaveBeenCalledTimes(1);
    expect(verify).toHaveBeenCalledWith(resetPasswordBody.token, process.env.ADMIN_RESET_PASSWORD_SECRET_KEY);
    expect(getUserService).toHaveBeenCalledTimes(1);
    expect(getUserService).toHaveBeenCalledWith({ email: resetPasswordBody.email }, getUserParameters);
    expect(compareSync).toHaveBeenCalledTimes(1);
    expect(compareSync).toHaveBeenCalledWith(resetPasswordBody.oldPassword, user.password);
    expect(resetPasswordService).toHaveBeenCalledTimes(1);
    expect(resetPasswordService).toHaveBeenCalledWith(resetPasswordBody);
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenLastCalledWith(PrismaDisconnectError.message, expect.any(String));
  });
});

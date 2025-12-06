import { RpcException } from '@nestjs/microservices';
import { BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaClient } from 'generated/prisma';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import LoggingService from '@share/libs/logging/logging.service';
import startUp from './pre-setup';
import { PRISMA_CLIENT } from '@share/di-token';
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
import { PrismaDisconnectError, PrismaNotFoundError } from '@share/test/pre-setup/mock/errors/prisma-errors';
import { ResetPassword } from '@share/dto/validators/user.dto';

let prismaService: PrismaClient;
let loggerService: LoggingService;
let userController: UserController;
let userService: UserService;

const oldPassword = autoGeneratePassword();

const resetPasswordBody: ResetPassword = {
  email: user.email,
  password: user.password,
  oldPassword,
  token: user.reset_password_token!,
};

const jwtPayload: jwt.JwtPayload = {
  email: user.email,
  password: oldPassword,
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

describe('reset password', () => {
  it('reset password success', async () => {
    expect.hasAssertions();
    const verify = jest.spyOn(jwt, 'verify').mockReturnValue(jwtPayload as any);
    const compareSync = jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);
    const update = jest.spyOn(prismaService.user, 'update').mockResolvedValue(user);
    const getDetailService = jest.spyOn(userService, 'getDetail').mockResolvedValue(user);
    const resetPasswordService = jest.spyOn(userService, 'resetPassword');
    const resetPasswordController = jest.spyOn(userController, 'resetPassword');
    await expect(userController.resetPassword(resetPasswordBody)).resolves.toBe(user);
    expect(resetPasswordController).toHaveBeenCalledTimes(1);
    expect(verify).toHaveBeenCalledTimes(1);
    expect(verify).toHaveBeenCalledWith(resetPasswordBody.token, process.env.ADMIN_RESET_PASSWORD_SECRET_KEY);
    expect(resetPasswordService).toHaveBeenCalledTimes(1);
    expect(resetPasswordService).toHaveBeenCalledWith(resetPasswordBody);
    expect(getDetailService).toHaveBeenCalledTimes(1);
    expect(getDetailService).toHaveBeenCalledWith(resetPasswordBody.email, { password: true });
    expect(compareSync).toHaveBeenCalledTimes(1);
    expect(compareSync).toHaveBeenCalledWith(resetPasswordBody.oldPassword, user.password);
    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith({
      where: {
        email: resetPasswordBody.email,
      },
      data: {
        reset_password_token: null,
        password: resetPasswordBody.password,
      },
      omit: {
        phone: true,
        password: true,
      },
    });
  });

  it('reset password failed with jwt verify got unknown error', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const verify = jest.spyOn(jwt, 'verify').mockImplementation(() => {
      throw JsonWebTokenUnknownError;
    });
    const compareSync = jest.spyOn(bcrypt, 'compareSync');
    const update = jest.spyOn(prismaService.user, 'update');
    const getDetailService = jest.spyOn(userService, 'getDetail');
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
    expect(getDetailService).not.toHaveBeenCalled();
    expect(compareSync).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });

  it('reset password failed with jwt verify got token expired error', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const verify = jest.spyOn(jwt, 'verify').mockImplementation(() => {
      throw JsonWebTokenExpiredError;
    });
    const compareSync = jest.spyOn(bcrypt, 'compareSync');
    const update = jest.spyOn(prismaService.user, 'update');
    const getDetailService = jest.spyOn(userService, 'getDetail');
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
    expect(getDetailService).not.toHaveBeenCalled();
    expect(compareSync).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });

  it('reset password failed with jwt verify got malformed error', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const verify = jest.spyOn(jwt, 'verify').mockImplementation(() => {
      throw JsonWebTokenMalformedError;
    });
    const compareSync = jest.spyOn(bcrypt, 'compareSync');
    const update = jest.spyOn(prismaService.user, 'update');
    const getDetailService = jest.spyOn(userService, 'getDetail');
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
    expect(getDetailService).not.toHaveBeenCalled();
    expect(compareSync).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });

  it('reset password failed with jwt verify result is null', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const verify = jest.spyOn(jwt, 'verify').mockReturnValue(null as any);
    const compareSync = jest.spyOn(bcrypt, 'compareSync');
    const update = jest.spyOn(prismaService.user, 'update');
    const getDetailService = jest.spyOn(userService, 'getDetail');
    const resetPasswordService = jest.spyOn(userService, 'resetPassword');
    const resetPasswordController = jest.spyOn(userController, 'resetPassword');
    await expect(userController.resetPassword(resetPasswordBody)).rejects.toThrow(
      new RpcException(new UnauthorizedException(createMessage(messages.USER.NOT_FOUND))),
    );
    expect(resetPasswordController).toHaveBeenCalledTimes(1);
    expect(verify).toHaveBeenCalledTimes(1);
    expect(verify).toHaveBeenCalledWith(resetPasswordBody.token, process.env.ADMIN_RESET_PASSWORD_SECRET_KEY);
    expect(resetPasswordService).not.toHaveBeenCalled();
    expect(getDetailService).not.toHaveBeenCalled();
    expect(compareSync).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenLastCalledWith(messages.USER.NOT_FOUND, expect.any(String));
  });

  it('reset password failed with jwt verify result is not same with user info', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const verify = jest.spyOn(jwt, 'verify').mockReturnValue({ ...jwtPayload, email: 'anotherEmail@gmail.com' } as any);
    const compareSync = jest.spyOn(bcrypt, 'compareSync');
    const update = jest.spyOn(prismaService.user, 'update');
    const getDetailService = jest.spyOn(userService, 'getDetail');
    const resetPasswordService = jest.spyOn(userService, 'resetPassword');
    const resetPasswordController = jest.spyOn(userController, 'resetPassword');
    await expect(userController.resetPassword(resetPasswordBody)).rejects.toThrow(
      new RpcException(new UnauthorizedException(createMessage(messages.USER.NOT_FOUND))),
    );
    expect(resetPasswordController).toHaveBeenCalledTimes(1);
    expect(verify).toHaveBeenCalledTimes(1);
    expect(verify).toHaveBeenCalledWith(resetPasswordBody.token, process.env.ADMIN_RESET_PASSWORD_SECRET_KEY);
    expect(resetPasswordService).not.toHaveBeenCalled();
    expect(getDetailService).not.toHaveBeenCalled();
    expect(compareSync).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenLastCalledWith(messages.USER.NOT_FOUND, expect.any(String));
  });

  it('reset password failed with getDetail got not found error', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const verify = jest.spyOn(jwt, 'verify').mockReturnValue(jwtPayload as any);
    const compareSync = jest.spyOn(bcrypt, 'compareSync');
    const update = jest.spyOn(prismaService.user, 'update');
    const getDetailService = jest.spyOn(userService, 'getDetail').mockImplementation(() => {
      throw new RpcException(new NotFoundException(messages.USER.NOT_FOUND));
    });
    const resetPasswordService = jest.spyOn(userService, 'resetPassword');
    const resetPasswordController = jest.spyOn(userController, 'resetPassword');
    await expect(userController.resetPassword(resetPasswordBody)).rejects.toThrow(
      new RpcException(new NotFoundException(messages.USER.NOT_FOUND)),
    );
    expect(resetPasswordController).toHaveBeenCalledTimes(1);
    expect(verify).toHaveBeenCalledTimes(1);
    expect(verify).toHaveBeenCalledWith(resetPasswordBody.token, process.env.ADMIN_RESET_PASSWORD_SECRET_KEY);
    expect(getDetailService).toHaveBeenCalledTimes(1);
    expect(getDetailService).toHaveBeenCalledWith(resetPasswordBody.email, { password: true });
    expect(resetPasswordService).not.toHaveBeenCalled();
    expect(compareSync).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
    expect(logMethod).not.toHaveBeenCalled();
  });

  it('reset password failed with getDetail got unknown error', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const verify = jest.spyOn(jwt, 'verify').mockReturnValue(jwtPayload as any);
    const compareSync = jest.spyOn(bcrypt, 'compareSync');
    const update = jest.spyOn(prismaService.user, 'update');
    const getDetailService = jest.spyOn(userService, 'getDetail').mockRejectedValue(UnknownError);
    const resetPasswordService = jest.spyOn(userService, 'resetPassword');
    const resetPasswordController = jest.spyOn(userController, 'resetPassword');
    await expect(userController.resetPassword(resetPasswordBody)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(messages.COMMON.COMMON_ERROR))),
    );
    expect(resetPasswordController).toHaveBeenCalledTimes(1);
    expect(verify).toHaveBeenCalledTimes(1);
    expect(verify).toHaveBeenCalledWith(resetPasswordBody.token, process.env.ADMIN_RESET_PASSWORD_SECRET_KEY);
    expect(getDetailService).toHaveBeenCalledTimes(1);
    expect(getDetailService).toHaveBeenCalledWith(resetPasswordBody.email, { password: true });
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenLastCalledWith(UnknownError.message, expect.any(String));
    expect(resetPasswordService).not.toHaveBeenCalled();
    expect(compareSync).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });

  it('reset password failed with getDetail got database disconnect error', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const verify = jest.spyOn(jwt, 'verify').mockReturnValue(jwtPayload as any);
    const compareSync = jest.spyOn(bcrypt, 'compareSync');
    const update = jest.spyOn(prismaService.user, 'update');
    const getDetailService = jest
      .spyOn(userService, 'getDetail')
      .mockRejectedValue(new RpcException(new BadRequestException(PrismaDisconnectError.message)));
    const resetPasswordService = jest.spyOn(userService, 'resetPassword');
    const resetPasswordController = jest.spyOn(userController, 'resetPassword');
    await expect(userController.resetPassword(resetPasswordBody)).rejects.toThrow(
      new RpcException(new BadRequestException(PrismaDisconnectError.message)),
    );
    expect(resetPasswordController).toHaveBeenCalledTimes(1);
    expect(verify).toHaveBeenCalledTimes(1);
    expect(verify).toHaveBeenCalledWith(resetPasswordBody.token, process.env.ADMIN_RESET_PASSWORD_SECRET_KEY);
    expect(getDetailService).toHaveBeenCalledTimes(1);
    expect(getDetailService).toHaveBeenCalledWith(resetPasswordBody.email, { password: true });
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenLastCalledWith(PrismaDisconnectError.message, expect.any(String));
    expect(resetPasswordService).not.toHaveBeenCalled();
    expect(compareSync).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });

  it('reset password failed with comparePassword got unknown error', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const verify = jest.spyOn(jwt, 'verify').mockReturnValue(jwtPayload as any);
    const compareSync = jest.spyOn(bcrypt, 'compareSync').mockImplementation(() => {
      throw UnknownError;
    });
    const update = jest.spyOn(prismaService.user, 'update');
    const getDetailService = jest.spyOn(userService, 'getDetail').mockResolvedValue(user);
    const resetPasswordService = jest.spyOn(userService, 'resetPassword');
    const resetPasswordController = jest.spyOn(userController, 'resetPassword');
    await expect(userController.resetPassword(resetPasswordBody)).rejects.toThrow(
      new RpcException(new BadRequestException(messages.COMMON.COMMON_ERROR)),
    );
    expect(resetPasswordController).toHaveBeenCalledTimes(1);
    expect(verify).toHaveBeenCalledTimes(1);
    expect(verify).toHaveBeenCalledWith(resetPasswordBody.token, process.env.ADMIN_RESET_PASSWORD_SECRET_KEY);
    expect(getDetailService).toHaveBeenCalledTimes(1);
    expect(getDetailService).toHaveBeenCalledWith(resetPasswordBody.email, { password: true });
    expect(compareSync).toHaveBeenCalledTimes(1);
    expect(compareSync).toHaveBeenCalledWith(resetPasswordBody.oldPassword, user.password);
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenLastCalledWith(UnknownError.message, expect.any(String));
    expect(resetPasswordService).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });

  it('reset password failed with comparePassword return false', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const verify = jest.spyOn(jwt, 'verify').mockReturnValue(jwtPayload as any);
    const compareSync = jest.spyOn(bcrypt, 'compareSync').mockReturnValue(false);
    const update = jest.spyOn(prismaService.user, 'update');
    const getDetailService = jest.spyOn(userService, 'getDetail').mockResolvedValue(user);
    const resetPasswordService = jest.spyOn(userService, 'resetPassword');
    const resetPasswordController = jest.spyOn(userController, 'resetPassword');
    await expect(userController.resetPassword(resetPasswordBody)).rejects.toThrow(
      new RpcException(new UnauthorizedException(createMessage(messages.USER.PASSWORD_NOT_MATCH))),
    );
    expect(resetPasswordController).toHaveBeenCalledTimes(1);
    expect(verify).toHaveBeenCalledTimes(1);
    expect(verify).toHaveBeenCalledWith(resetPasswordBody.token, process.env.ADMIN_RESET_PASSWORD_SECRET_KEY);
    expect(getDetailService).toHaveBeenCalledTimes(1);
    expect(getDetailService).toHaveBeenCalledWith(resetPasswordBody.email, { password: true });
    expect(compareSync).toHaveBeenCalledTimes(1);
    expect(compareSync).toHaveBeenCalledWith(resetPasswordBody.oldPassword, user.password);
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenLastCalledWith(messages.USER.PASSWORD_NOT_MATCH, expect.any(String));
    expect(resetPasswordService).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });

  it('reset password failed when resetPassword method got unknown error', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const verify = jest.spyOn(jwt, 'verify').mockReturnValue(jwtPayload as any);
    const compareSync = jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);
    const update = jest.spyOn(prismaService.user, 'update').mockRejectedValue(UnknownError);
    const getDetailService = jest.spyOn(userService, 'getDetail').mockResolvedValue(user);
    const resetPasswordService = jest.spyOn(userService, 'resetPassword');
    const resetPasswordController = jest.spyOn(userController, 'resetPassword');
    await expect(userController.resetPassword(resetPasswordBody)).rejects.toThrow(
      new RpcException(new BadRequestException(messages.COMMON.COMMON_ERROR)),
    );
    expect(resetPasswordController).toHaveBeenCalledTimes(1);
    expect(verify).toHaveBeenCalledTimes(1);
    expect(verify).toHaveBeenCalledWith(resetPasswordBody.token, process.env.ADMIN_RESET_PASSWORD_SECRET_KEY);
    expect(getDetailService).toHaveBeenCalledTimes(1);
    expect(getDetailService).toHaveBeenCalledWith(resetPasswordBody.email, { password: true });
    expect(compareSync).toHaveBeenCalledTimes(1);
    expect(compareSync).toHaveBeenCalledWith(resetPasswordBody.oldPassword, user.password);
    expect(resetPasswordService).toHaveBeenCalledTimes(1);
    expect(resetPasswordService).toHaveBeenCalledWith(resetPasswordBody);
    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith({
      where: {
        email: resetPasswordBody.email,
      },
      data: {
        reset_password_token: null,
        password: resetPasswordBody.password,
      },
      omit: {
        phone: true,
        password: true,
      },
    });
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenLastCalledWith(UnknownError.message, expect.any(String));
  });

  it('reset password failed when resetPassword method got not found error', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const verify = jest.spyOn(jwt, 'verify').mockReturnValue(jwtPayload as any);
    const compareSync = jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);
    const update = jest.spyOn(prismaService.user, 'update').mockRejectedValue(PrismaNotFoundError);
    const getDetailService = jest.spyOn(userService, 'getDetail').mockResolvedValue(user);
    const resetPasswordService = jest.spyOn(userService, 'resetPassword');
    const resetPasswordController = jest.spyOn(userController, 'resetPassword');
    await expect(userController.resetPassword(resetPasswordBody)).rejects.toThrow(
      new RpcException(new UnauthorizedException(messages.USER.NOT_FOUND)),
    );
    expect(resetPasswordController).toHaveBeenCalledTimes(1);
    expect(verify).toHaveBeenCalledTimes(1);
    expect(verify).toHaveBeenCalledWith(resetPasswordBody.token, process.env.ADMIN_RESET_PASSWORD_SECRET_KEY);
    expect(getDetailService).toHaveBeenCalledTimes(1);
    expect(getDetailService).toHaveBeenCalledWith(resetPasswordBody.email, { password: true });
    expect(compareSync).toHaveBeenCalledTimes(1);
    expect(compareSync).toHaveBeenCalledWith(resetPasswordBody.oldPassword, user.password);
    expect(resetPasswordService).toHaveBeenCalledTimes(1);
    expect(resetPasswordService).toHaveBeenCalledWith(resetPasswordBody);
    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith({
      where: {
        email: resetPasswordBody.email,
      },
      data: {
        reset_password_token: null,
        password: resetPasswordBody.password,
      },
      omit: {
        phone: true,
        password: true,
      },
    });
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(messages.USER.NOT_FOUND, expect.any(String));
  });

  it('reset password failed when resetPassword method got database disconnect error', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const verify = jest.spyOn(jwt, 'verify').mockReturnValue(jwtPayload as any);
    const compareSync = jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);
    const update = jest.spyOn(prismaService.user, 'update').mockRejectedValue(PrismaDisconnectError);
    const getDetailService = jest.spyOn(userService, 'getDetail').mockResolvedValue(user);
    const resetPasswordService = jest.spyOn(userService, 'resetPassword');
    const resetPasswordController = jest.spyOn(userController, 'resetPassword');
    await expect(userController.resetPassword(resetPasswordBody)).rejects.toThrow(
      new RpcException(new BadRequestException(PrismaDisconnectError.message)),
    );
    expect(resetPasswordController).toHaveBeenCalledTimes(1);
    expect(verify).toHaveBeenCalledTimes(1);
    expect(verify).toHaveBeenCalledWith(resetPasswordBody.token, process.env.ADMIN_RESET_PASSWORD_SECRET_KEY);
    expect(getDetailService).toHaveBeenCalledTimes(1);
    expect(getDetailService).toHaveBeenCalledWith(resetPasswordBody.email, { password: true });
    expect(compareSync).toHaveBeenCalledTimes(1);
    expect(compareSync).toHaveBeenCalledWith(resetPasswordBody.oldPassword, user.password);
    expect(resetPasswordService).toHaveBeenCalledTimes(1);
    expect(resetPasswordService).toHaveBeenCalledWith(resetPasswordBody);
    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith({
      where: {
        email: resetPasswordBody.email,
      },
      data: {
        reset_password_token: null,
        password: resetPasswordBody.password,
      },
      omit: {
        phone: true,
        password: true,
      },
    });
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenLastCalledWith(PrismaDisconnectError.message, expect.any(String));
  });

  it('reset password failed with sex invalid', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const sexInvalidException = new BadRequestException(createMessage(messages.USER.YOUR_GENDER_INVALID));
    const verify = jest.spyOn(jwt, 'verify').mockReturnValue(jwtPayload as any);
    const compareSync = jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);
    const update = jest.spyOn(prismaService.user, 'update').mockRejectedValue(sexInvalidException);
    const getDetailService = jest.spyOn(userService, 'getDetail').mockResolvedValue(user);
    const resetPasswordService = jest.spyOn(userService, 'resetPassword');
    const resetPasswordController = jest.spyOn(userController, 'resetPassword');
    await expect(userController.resetPassword(resetPasswordBody)).rejects.toThrow(
      new RpcException(sexInvalidException),
    );
    expect(resetPasswordController).toHaveBeenCalledTimes(1);
    expect(verify).toHaveBeenCalledTimes(1);
    expect(verify).toHaveBeenCalledWith(resetPasswordBody.token, process.env.ADMIN_RESET_PASSWORD_SECRET_KEY);
    expect(getDetailService).toHaveBeenCalledTimes(1);
    expect(getDetailService).toHaveBeenCalledWith(resetPasswordBody.email, { password: true });
    expect(compareSync).toHaveBeenCalledTimes(1);
    expect(compareSync).toHaveBeenCalledWith(resetPasswordBody.oldPassword, user.password);
    expect(resetPasswordService).toHaveBeenCalledTimes(1);
    expect(resetPasswordService).toHaveBeenCalledWith(resetPasswordBody);
    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith({
      where: {
        email: resetPasswordBody.email,
      },
      data: {
        reset_password_token: null,
        password: resetPasswordBody.password,
      },
      omit: {
        phone: true,
        password: true,
      },
    });
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenLastCalledWith(sexInvalidException.message, expect.any(String));
  });

  it('reset password failed with power invalid', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const powerInvalidException = new BadRequestException(createMessage(messages.USER.YOUR_POWER_INVALID));
    const verify = jest.spyOn(jwt, 'verify').mockReturnValue(jwtPayload as any);
    const compareSync = jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);
    const update = jest.spyOn(prismaService.user, 'update').mockRejectedValue(powerInvalidException);
    const getDetailService = jest.spyOn(userService, 'getDetail').mockResolvedValue(user);
    const resetPasswordService = jest.spyOn(userService, 'resetPassword');
    const resetPasswordController = jest.spyOn(userController, 'resetPassword');
    await expect(userController.resetPassword(resetPasswordBody)).rejects.toThrow(
      new RpcException(powerInvalidException),
    );
    expect(resetPasswordController).toHaveBeenCalledTimes(1);
    expect(verify).toHaveBeenCalledTimes(1);
    expect(verify).toHaveBeenCalledWith(resetPasswordBody.token, process.env.ADMIN_RESET_PASSWORD_SECRET_KEY);
    expect(getDetailService).toHaveBeenCalledTimes(1);
    expect(getDetailService).toHaveBeenCalledWith(resetPasswordBody.email, { password: true });
    expect(compareSync).toHaveBeenCalledTimes(1);
    expect(compareSync).toHaveBeenCalledWith(resetPasswordBody.oldPassword, user.password);
    expect(resetPasswordService).toHaveBeenCalledTimes(1);
    expect(resetPasswordService).toHaveBeenCalledWith(resetPasswordBody);
    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith({
      where: {
        email: resetPasswordBody.email,
      },
      data: {
        reset_password_token: null,
        password: resetPasswordBody.password,
      },
      omit: {
        phone: true,
        password: true,
      },
    });
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenLastCalledWith(powerInvalidException.message, expect.any(String));
  });

  it('reset password failed with email was already exist', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const emailExistException = new UnauthorizedException(createMessage(messages.USER.EMAIL_REGIS_ALREADY_EXIST));
    const verify = jest.spyOn(jwt, 'verify').mockReturnValue(jwtPayload as any);
    const compareSync = jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);
    const update = jest.spyOn(prismaService.user, 'update').mockRejectedValue(emailExistException);
    const getDetailService = jest.spyOn(userService, 'getDetail').mockResolvedValue(user);
    const resetPasswordService = jest.spyOn(userService, 'resetPassword');
    const resetPasswordController = jest.spyOn(userController, 'resetPassword');
    await expect(userController.resetPassword(resetPasswordBody)).rejects.toThrow(
      new RpcException(emailExistException),
    );
    expect(resetPasswordController).toHaveBeenCalledTimes(1);
    expect(verify).toHaveBeenCalledTimes(1);
    expect(verify).toHaveBeenCalledWith(resetPasswordBody.token, process.env.ADMIN_RESET_PASSWORD_SECRET_KEY);
    expect(getDetailService).toHaveBeenCalledTimes(1);
    expect(getDetailService).toHaveBeenCalledWith(resetPasswordBody.email, { password: true });
    expect(compareSync).toHaveBeenCalledTimes(1);
    expect(compareSync).toHaveBeenCalledWith(resetPasswordBody.oldPassword, user.password);
    expect(resetPasswordService).toHaveBeenCalledTimes(1);
    expect(resetPasswordService).toHaveBeenCalledWith(resetPasswordBody);
    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith({
      where: {
        email: resetPasswordBody.email,
      },
      data: {
        reset_password_token: null,
        password: resetPasswordBody.password,
      },
      omit: {
        phone: true,
        password: true,
      },
    });
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenLastCalledWith(emailExistException.message, expect.any(String));
  });

  it('reset password failed with phone was already exist', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const phoneExistException = new UnauthorizedException(createMessage(messages.USER.PHONE_ALREADY_EXIST));
    const verify = jest.spyOn(jwt, 'verify').mockReturnValue(jwtPayload as any);
    const compareSync = jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);
    const update = jest.spyOn(prismaService.user, 'update').mockRejectedValue(phoneExistException);
    const getDetailService = jest.spyOn(userService, 'getDetail').mockResolvedValue(user);
    const resetPasswordService = jest.spyOn(userService, 'resetPassword');
    const resetPasswordController = jest.spyOn(userController, 'resetPassword');
    await expect(userController.resetPassword(resetPasswordBody)).rejects.toThrow(
      new RpcException(phoneExistException),
    );
    expect(resetPasswordController).toHaveBeenCalledTimes(1);
    expect(verify).toHaveBeenCalledTimes(1);
    expect(verify).toHaveBeenCalledWith(resetPasswordBody.token, process.env.ADMIN_RESET_PASSWORD_SECRET_KEY);
    expect(getDetailService).toHaveBeenCalledTimes(1);
    expect(getDetailService).toHaveBeenCalledWith(resetPasswordBody.email, { password: true });
    expect(compareSync).toHaveBeenCalledTimes(1);
    expect(compareSync).toHaveBeenCalledWith(resetPasswordBody.oldPassword, user.password);
    expect(resetPasswordService).toHaveBeenCalledTimes(1);
    expect(resetPasswordService).toHaveBeenCalledWith(resetPasswordBody);
    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith({
      where: {
        email: resetPasswordBody.email,
      },
      data: {
        reset_password_token: null,
        password: resetPasswordBody.password,
      },
      omit: {
        phone: true,
        password: true,
      },
    });
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenLastCalledWith(phoneExistException.message, expect.any(String));
  });
});

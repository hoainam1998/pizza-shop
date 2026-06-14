import { RpcException } from '@nestjs/microservices';
import { BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaClient } from 'generated/prisma';
import LoggingService from '@share/libs/logging/logging.service';
import startUp from './pre-setup';
import UserController from '../user.controller';
import UserService from '../user.service';
import { user, resetPasswordToken } from '@share/test/pre-setup/mock/data/user';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import { createMessage } from '@share/utils';
import messages from '@share/constants/messages';
import { PrismaDisconnectError, PrismaNotFoundError } from '@share/test/pre-setup/mock/errors/prisma-errors';
import { PRISMA_CLIENT } from '@share/di-token';
import { APP_NAME, POWER_NUMERIC, STATUS } from '@share/enums';

let loggerService: LoggingService;
let userController: UserController;
let userService: UserService;
let prismaClient: PrismaClient;

const response = {
  password: expect.any(String),
  email: user.email,
  reset_password_link: expect.any(String),
};

const refreshResetPasswordTokenBody = {
  token: resetPasswordToken,
  by: APP_NAME.ADMIN,
};

beforeAll(async () => {
  const moduleRef = await startUp();
  userService = moduleRef.get(UserService);
  userController = moduleRef.get(UserController);
  loggerService = moduleRef.get(LoggingService);
  prismaClient = moduleRef.get(PRISMA_CLIENT);
});

describe('refresh reset password token', () => {
  it('refresh reset password token success', async () => {
    expect.hasAssertions();
    const validateUserPermission = jest.spyOn(userService, 'validateUserPermission');
    const findFirstOrThrow = jest.spyOn(prismaClient.user, 'findFirstOrThrow').mockResolvedValue(user);
    const update = jest.spyOn(prismaClient.user, 'update').mockResolvedValue(user);
    const refreshResetPasswordTokenService = jest.spyOn(userService, 'refreshResetPasswordToken');
    const refreshResetPasswordTokenController = jest.spyOn(userController, 'refreshResetPasswordToken');
    await expect(userController.refreshResetPasswordToken(refreshResetPasswordTokenBody)).resolves.toEqual(response);
    expect(refreshResetPasswordTokenController).toHaveBeenCalledTimes(1);
    expect(refreshResetPasswordTokenService).toHaveBeenCalledTimes(1);
    expect(refreshResetPasswordTokenService).toHaveBeenCalledWith(refreshResetPasswordTokenBody);
    expect(findFirstOrThrow).toHaveBeenCalledTimes(1);
    expect(findFirstOrThrow).toHaveBeenCalledWith({
      where: {
        reset_password_token: refreshResetPasswordTokenBody.token,
      },
      select: {
        user_id: true,
        email: true,
        power: true,
        active: true,
      },
    });
    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith({
      where: {
        user_id: user.user_id,
      },
      data: {
        password: expect.any(String),
        reset_password_token: expect.any(String),
      },
    });
    expect(validateUserPermission).toHaveBeenCalledTimes(1);
    expect(validateUserPermission).toHaveBeenCalledWith(refreshResetPasswordTokenBody, user);
  });

  it('refresh reset password token failed with sale view and admin role', async () => {
    expect.hasAssertions();
    const loggerError = jest.spyOn(loggerService, 'error').mockImplementation();
    const validateUserPermission = jest.spyOn(userService, 'validateUserPermission');
    const refreshResetPasswordTokenBodyWithSale = { ...refreshResetPasswordTokenBody, by: APP_NAME.SALE };
    const userWithAdminRole = { ...user, power: POWER_NUMERIC.ADMIN };
    const findFirstOrThrow = jest.spyOn(prismaClient.user, 'findFirstOrThrow').mockResolvedValue(userWithAdminRole);
    const update = jest.spyOn(prismaClient.user, 'update').mockResolvedValue(user);
    const refreshResetPasswordTokenService = jest.spyOn(userService, 'refreshResetPasswordToken');
    const refreshResetPasswordTokenController = jest.spyOn(userController, 'refreshResetPasswordToken');
    await expect(userController.refreshResetPasswordToken(refreshResetPasswordTokenBodyWithSale)).rejects.toThrow(
      new RpcException(new UnauthorizedException(createMessage(messages.USER.NOT_ALLOW_ADMIN_LOGIN))),
    );
    expect(refreshResetPasswordTokenController).toHaveBeenCalledTimes(1);
    expect(refreshResetPasswordTokenService).toHaveBeenCalledTimes(1);
    expect(refreshResetPasswordTokenService).toHaveBeenCalledWith(refreshResetPasswordTokenBodyWithSale);
    expect(findFirstOrThrow).toHaveBeenCalledTimes(1);
    expect(findFirstOrThrow).toHaveBeenCalledWith({
      where: {
        reset_password_token: refreshResetPasswordTokenBodyWithSale.token,
      },
      select: {
        user_id: true,
        email: true,
        power: true,
        active: true,
      },
    });
    expect(update).not.toHaveBeenCalled();
    expect(validateUserPermission).toHaveBeenCalledTimes(1);
    expect(validateUserPermission).toHaveBeenCalledWith(refreshResetPasswordTokenBodyWithSale, userWithAdminRole);
    expect(loggerError).toHaveBeenCalledTimes(1);
    expect(loggerError).toHaveBeenCalledWith(messages.USER.NOT_ALLOW_ADMIN_LOGIN, expect.any(String));
  });

  it('refresh reset password token failed with admin view and sale role', async () => {
    expect.hasAssertions();
    const loggerError = jest.spyOn(loggerService, 'error').mockImplementation();
    const validateUserPermission = jest.spyOn(userService, 'validateUserPermission');
    const refreshResetPasswordTokenBodyWithAdmin = { ...refreshResetPasswordTokenBody, by: APP_NAME.ADMIN };
    const userWithSaleRole = { ...user, power: POWER_NUMERIC.SALE };
    const findFirstOrThrow = jest.spyOn(prismaClient.user, 'findFirstOrThrow').mockResolvedValue(userWithSaleRole);
    const update = jest.spyOn(prismaClient.user, 'update').mockResolvedValue(user);
    const refreshResetPasswordTokenService = jest.spyOn(userService, 'refreshResetPasswordToken');
    const refreshResetPasswordTokenController = jest.spyOn(userController, 'refreshResetPasswordToken');
    await expect(userController.refreshResetPasswordToken(refreshResetPasswordTokenBodyWithAdmin)).rejects.toThrow(
      new RpcException(new UnauthorizedException(createMessage(messages.USER.NOT_ALLOW_SALE_LOGIN))),
    );
    expect(refreshResetPasswordTokenController).toHaveBeenCalledTimes(1);
    expect(refreshResetPasswordTokenService).toHaveBeenCalledTimes(1);
    expect(refreshResetPasswordTokenService).toHaveBeenCalledWith(refreshResetPasswordTokenBodyWithAdmin);
    expect(findFirstOrThrow).toHaveBeenCalledTimes(1);
    expect(findFirstOrThrow).toHaveBeenCalledWith({
      where: {
        reset_password_token: refreshResetPasswordTokenBodyWithAdmin.token,
      },
      select: {
        user_id: true,
        email: true,
        power: true,
        active: true,
      },
    });
    expect(update).not.toHaveBeenCalled();
    expect(validateUserPermission).toHaveBeenCalledTimes(1);
    expect(validateUserPermission).toHaveBeenCalledWith(refreshResetPasswordTokenBodyWithAdmin, userWithSaleRole);
    expect(loggerError).toHaveBeenCalledTimes(1);
    expect(loggerError).toHaveBeenCalledWith(messages.USER.NOT_ALLOW_SALE_LOGIN, expect.any(String));
  });

  it('refresh reset password token failed with user blocked', async () => {
    expect.hasAssertions();
    const userBlocked = { ...user, active: STATUS.BLOCK };
    const validateUserPermission = jest.spyOn(userService, 'validateUserPermission');
    const findFirstOrThrow = jest.spyOn(prismaClient.user, 'findFirstOrThrow').mockResolvedValue(userBlocked);
    const update = jest.spyOn(prismaClient.user, 'update').mockImplementation(jest.fn());
    const refreshResetPasswordTokenService = jest.spyOn(userService, 'refreshResetPasswordToken');
    const refreshResetPasswordTokenController = jest.spyOn(userController, 'refreshResetPasswordToken');
    await expect(userController.refreshResetPasswordToken(refreshResetPasswordTokenBody)).rejects.toThrow(
      new RpcException(new UnauthorizedException(messages.USER.YOU_WERE_BLOCKED)),
    );
    expect(refreshResetPasswordTokenController).toHaveBeenCalledTimes(1);
    expect(refreshResetPasswordTokenService).toHaveBeenCalledTimes(1);
    expect(refreshResetPasswordTokenService).toHaveBeenCalledWith(refreshResetPasswordTokenBody);
    expect(findFirstOrThrow).toHaveBeenCalledTimes(1);
    expect(findFirstOrThrow).toHaveBeenCalledWith({
      where: {
        reset_password_token: refreshResetPasswordTokenBody.token,
      },
      select: {
        user_id: true,
        email: true,
        power: true,
        active: true,
      },
    });
    expect(update).not.toHaveBeenCalled();
    expect(validateUserPermission).not.toHaveBeenCalled();
  });

  it('refresh reset password token failed with findFirstOrThrow got not found error', async () => {
    expect.hasAssertions();
    const validateUserPermission = jest.spyOn(userService, 'validateUserPermission');
    const loggerError = jest.spyOn(loggerService, 'error').mockImplementation();
    const findFirstOrThrow = jest.spyOn(prismaClient.user, 'findFirstOrThrow').mockRejectedValue(PrismaNotFoundError);
    const update = jest.spyOn(prismaClient.user, 'update').mockResolvedValue(user);
    const refreshResetPasswordTokenService = jest.spyOn(userService, 'refreshResetPasswordToken');
    const refreshResetPasswordTokenController = jest.spyOn(userController, 'refreshResetPasswordToken');
    await expect(userController.refreshResetPasswordToken(refreshResetPasswordTokenBody)).rejects.toThrow(
      new RpcException(new NotFoundException(messages.USER.NOT_FOUND)),
    );
    expect(refreshResetPasswordTokenController).toHaveBeenCalledTimes(1);
    expect(refreshResetPasswordTokenService).toHaveBeenCalledTimes(1);
    expect(refreshResetPasswordTokenService).toHaveBeenCalledWith(refreshResetPasswordTokenBody);
    expect(findFirstOrThrow).toHaveBeenCalledTimes(1);
    expect(findFirstOrThrow).toHaveBeenCalledWith({
      where: {
        reset_password_token: refreshResetPasswordTokenBody.token,
      },
      select: {
        user_id: true,
        email: true,
        power: true,
        active: true,
      },
    });
    expect(update).not.toHaveBeenCalled();
    expect(validateUserPermission).not.toHaveBeenCalled();
    expect(loggerError).toHaveBeenCalledTimes(1);
    expect(loggerError).toHaveBeenCalledWith(messages.USER.NOT_FOUND, expect.any(String));
  });

  it('refresh reset password token failed with findFirstOrThrow got unknown error', async () => {
    expect.hasAssertions();
    const loggerError = jest.spyOn(loggerService, 'error').mockImplementation();
    const validateUserPermission = jest.spyOn(userService, 'validateUserPermission');
    const findFirstOrThrow = jest.spyOn(prismaClient.user, 'findFirstOrThrow').mockRejectedValue(UnknownError);
    const update = jest.spyOn(prismaClient.user, 'update').mockResolvedValue(user);
    const refreshResetPasswordTokenService = jest.spyOn(userService, 'refreshResetPasswordToken');
    const refreshResetPasswordTokenController = jest.spyOn(userController, 'refreshResetPasswordToken');
    await expect(userController.refreshResetPasswordToken(refreshResetPasswordTokenBody)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(messages.COMMON.COMMON_ERROR))),
    );
    expect(refreshResetPasswordTokenController).toHaveBeenCalledTimes(1);
    expect(refreshResetPasswordTokenService).toHaveBeenCalledTimes(1);
    expect(refreshResetPasswordTokenService).toHaveBeenCalledWith(refreshResetPasswordTokenBody);
    expect(findFirstOrThrow).toHaveBeenCalledTimes(1);
    expect(findFirstOrThrow).toHaveBeenCalledWith({
      where: {
        reset_password_token: refreshResetPasswordTokenBody.token,
      },
      select: {
        user_id: true,
        email: true,
        power: true,
        active: true,
      },
    });
    expect(update).not.toHaveBeenCalled();
    expect(validateUserPermission).not.toHaveBeenCalled();
    expect(loggerError).toHaveBeenCalledTimes(1);
    expect(loggerError).toHaveBeenCalledWith(UnknownError.message, expect.any(String));
  });

  it('refresh reset password token failed with findFirstOrThrow got database disconnect error', async () => {
    expect.hasAssertions();
    const loggerError = jest.spyOn(loggerService, 'error').mockImplementation();
    const validateUserPermission = jest.spyOn(userService, 'validateUserPermission');
    const findFirstOrThrow = jest.spyOn(prismaClient.user, 'findFirstOrThrow').mockRejectedValue(PrismaDisconnectError);
    const update = jest.spyOn(prismaClient.user, 'update').mockResolvedValue(user);
    const refreshResetPasswordTokenService = jest.spyOn(userService, 'refreshResetPasswordToken');
    const refreshResetPasswordTokenController = jest.spyOn(userController, 'refreshResetPasswordToken');
    await expect(userController.refreshResetPasswordToken(refreshResetPasswordTokenBody)).rejects.toThrow(
      new RpcException(new RpcException(new BadRequestException(PrismaDisconnectError.message))),
    );
    expect(refreshResetPasswordTokenController).toHaveBeenCalledTimes(1);
    expect(refreshResetPasswordTokenService).toHaveBeenCalledTimes(1);
    expect(refreshResetPasswordTokenService).toHaveBeenCalledWith(refreshResetPasswordTokenBody);
    expect(findFirstOrThrow).toHaveBeenCalledTimes(1);
    expect(findFirstOrThrow).toHaveBeenCalledWith({
      where: {
        reset_password_token: refreshResetPasswordTokenBody.token,
      },
      select: {
        user_id: true,
        email: true,
        power: true,
        active: true,
      },
    });
    expect(update).not.toHaveBeenCalled();
    expect(validateUserPermission).not.toHaveBeenCalled();
    expect(loggerError).toHaveBeenCalledTimes(1);
    expect(loggerError).toHaveBeenCalledWith(PrismaDisconnectError.message, expect.any(String));
  });

  it('refresh reset password token failed with update got not found error', async () => {
    expect.hasAssertions();
    const loggerError = jest.spyOn(loggerService, 'error').mockImplementation();
    const validateUserPermission = jest.spyOn(userService, 'validateUserPermission');
    const findFirstOrThrow = jest.spyOn(prismaClient.user, 'findFirstOrThrow').mockResolvedValue(user);
    const update = jest.spyOn(prismaClient.user, 'update').mockRejectedValue(PrismaNotFoundError);
    const refreshResetPasswordTokenService = jest.spyOn(userService, 'refreshResetPasswordToken');
    const refreshResetPasswordTokenController = jest.spyOn(userController, 'refreshResetPasswordToken');
    await expect(userController.refreshResetPasswordToken(refreshResetPasswordTokenBody)).rejects.toThrow(
      new RpcException(new NotFoundException(messages.USER.NOT_FOUND)),
    );
    expect(refreshResetPasswordTokenController).toHaveBeenCalledTimes(1);
    expect(refreshResetPasswordTokenService).toHaveBeenCalledTimes(1);
    expect(refreshResetPasswordTokenService).toHaveBeenCalledWith(refreshResetPasswordTokenBody);
    expect(findFirstOrThrow).toHaveBeenCalledTimes(1);
    expect(findFirstOrThrow).toHaveBeenCalledWith({
      where: {
        reset_password_token: refreshResetPasswordTokenBody.token,
      },
      select: {
        user_id: true,
        email: true,
        power: true,
        active: true,
      },
    });
    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith({
      where: {
        user_id: user.user_id,
      },
      data: {
        password: expect.any(String),
        reset_password_token: expect.any(String),
      },
    });
    expect(validateUserPermission).toHaveBeenCalledTimes(1);
    expect(validateUserPermission).toHaveBeenCalledWith(refreshResetPasswordTokenBody, user);
    expect(loggerError).toHaveBeenCalledTimes(1);
    expect(loggerError).toHaveBeenCalledWith(messages.USER.NOT_FOUND, expect.any(String));
  });

  it('refresh reset password token failed with update got unknown error', async () => {
    expect.hasAssertions();
    const loggerError = jest.spyOn(loggerService, 'error').mockImplementation();
    const validateUserPermission = jest.spyOn(userService, 'validateUserPermission');
    const findFirstOrThrow = jest.spyOn(prismaClient.user, 'findFirstOrThrow').mockResolvedValue(user);
    const update = jest.spyOn(prismaClient.user, 'update').mockRejectedValue(UnknownError);
    const refreshResetPasswordTokenService = jest.spyOn(userService, 'refreshResetPasswordToken');
    const refreshResetPasswordTokenController = jest.spyOn(userController, 'refreshResetPasswordToken');
    await expect(userController.refreshResetPasswordToken(refreshResetPasswordTokenBody)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(messages.COMMON.COMMON_ERROR))),
    );
    expect(refreshResetPasswordTokenController).toHaveBeenCalledTimes(1);
    expect(refreshResetPasswordTokenService).toHaveBeenCalledTimes(1);
    expect(refreshResetPasswordTokenService).toHaveBeenCalledWith(refreshResetPasswordTokenBody);
    expect(findFirstOrThrow).toHaveBeenCalledTimes(1);
    expect(findFirstOrThrow).toHaveBeenCalledWith({
      where: {
        reset_password_token: refreshResetPasswordTokenBody.token,
      },
      select: {
        user_id: true,
        email: true,
        power: true,
        active: true,
      },
    });
    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith({
      where: {
        user_id: user.user_id,
      },
      data: {
        password: expect.any(String),
        reset_password_token: expect.any(String),
      },
    });
    expect(validateUserPermission).toHaveBeenCalledTimes(1);
    expect(validateUserPermission).toHaveBeenCalledWith(refreshResetPasswordTokenBody, user);
    expect(loggerError).toHaveBeenCalledTimes(1);
    expect(loggerError).toHaveBeenCalledWith(UnknownError.message, expect.any(String));
  });

  it('refresh reset password token failed with update got database disconnect error', async () => {
    expect.hasAssertions();
    const loggerError = jest.spyOn(loggerService, 'error').mockImplementation();
    const validateUserPermission = jest.spyOn(userService, 'validateUserPermission');
    const findFirstOrThrow = jest.spyOn(prismaClient.user, 'findFirstOrThrow').mockResolvedValue(user);
    const update = jest.spyOn(prismaClient.user, 'update').mockRejectedValue(PrismaDisconnectError);
    const refreshResetPasswordTokenService = jest.spyOn(userService, 'refreshResetPasswordToken');
    const refreshResetPasswordTokenController = jest.spyOn(userController, 'refreshResetPasswordToken');
    await expect(userController.refreshResetPasswordToken(refreshResetPasswordTokenBody)).rejects.toThrow(
      new RpcException(new RpcException(new BadRequestException(PrismaDisconnectError.message))),
    );
    expect(refreshResetPasswordTokenController).toHaveBeenCalledTimes(1);
    expect(refreshResetPasswordTokenService).toHaveBeenCalledTimes(1);
    expect(refreshResetPasswordTokenService).toHaveBeenCalledWith(refreshResetPasswordTokenBody);
    expect(findFirstOrThrow).toHaveBeenCalledTimes(1);
    expect(findFirstOrThrow).toHaveBeenCalledWith({
      where: {
        reset_password_token: refreshResetPasswordTokenBody.token,
      },
      select: {
        user_id: true,
        email: true,
        power: true,
        active: true,
      },
    });
    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith({
      where: {
        user_id: user.user_id,
      },
      data: {
        password: expect.any(String),
        reset_password_token: expect.any(String),
      },
    });
    expect(validateUserPermission).toHaveBeenCalledTimes(1);
    expect(validateUserPermission).toHaveBeenCalledWith(refreshResetPasswordTokenBody, user);
    expect(loggerError).toHaveBeenCalledTimes(1);
    expect(loggerError).toHaveBeenCalledWith(PrismaDisconnectError.message, expect.any(String));
  });
});

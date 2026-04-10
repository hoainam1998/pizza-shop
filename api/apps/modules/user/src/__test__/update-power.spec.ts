import { RpcException } from '@nestjs/microservices';
import { BadRequestException, NotFoundException } from '@nestjs/common';
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
import { PrismaDisconnectError, PrismaNotFoundError } from '@share/test/pre-setup/mock/errors/prisma-errors';
import { POWER_NUMERIC } from '@share/enums';

let prismaService: PrismaClient;
let loggerService: LoggingService;
let userController: UserController;
let userService: UserService;

const payload: any = {
  user_id: user.user_id,
  power: POWER_NUMERIC.SALE,
};

beforeAll(async () => {
  const moduleRef = await startUp();
  userService = moduleRef.get(UserService);
  userController = moduleRef.get(UserController);
  loggerService = moduleRef.get(LoggingService);
  prismaService = moduleRef.get(PRISMA_CLIENT);
});

describe('update user power', () => {
  it('update user power success', async () => {
    expect.hasAssertions();
    const update = jest.spyOn(prismaService.user, 'update').mockResolvedValue(user);
    const logout = jest.spyOn(userService, 'logout').mockResolvedValue(null);
    const updatePowerService = jest.spyOn(userService, 'updatePower');
    const updatePowerController = jest.spyOn(userController, 'updatePower');
    await expect(userController.updatePower(payload)).resolves.toBe(user);
    expect(updatePowerController).toHaveBeenCalledTimes(1);
    expect(updatePowerService).toHaveBeenCalledTimes(1);
    expect(updatePowerService).toHaveBeenCalledWith(payload);
    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith({
      data: {
        power: payload.power,
      },
      where: {
        user_id: payload.user_id,
      },
    });
    expect(logout).toHaveBeenCalledTimes(1);
    expect(logout).toHaveBeenCalledWith(payload.user_id);
  });

  it('update user power failed with unknown error', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const update = jest.spyOn(prismaService.user, 'update').mockRejectedValue(UnknownError);
    const logout = jest.spyOn(userService, 'logout');
    const updatePowerService = jest.spyOn(userService, 'updatePower');
    const updatePowerController = jest.spyOn(userController, 'updatePower');
    await expect(userController.updatePower(payload)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(messages.COMMON.COMMON_ERROR))),
    );
    expect(updatePowerController).toHaveBeenCalledTimes(1);
    expect(updatePowerService).toHaveBeenCalledTimes(1);
    expect(updatePowerService).toHaveBeenCalledWith(payload);
    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith({
      data: {
        power: payload.power,
      },
      where: {
        user_id: payload.user_id,
      },
    });
    expect(logout).not.toHaveBeenCalled();
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(UnknownError.message, expect.any(String));
  });

  it('update user power failed with not found error', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const update = jest.spyOn(prismaService.user, 'update').mockRejectedValue(PrismaNotFoundError);
    const logout = jest.spyOn(userService, 'logout');
    const updatePowerService = jest.spyOn(userService, 'updatePower');
    const updatePowerController = jest.spyOn(userController, 'updatePower');
    await expect(userController.updatePower(payload)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(messages.USER.NOT_FOUND))),
    );
    expect(updatePowerController).toHaveBeenCalledTimes(1);
    expect(updatePowerService).toHaveBeenCalledTimes(1);
    expect(updatePowerService).toHaveBeenCalledWith(payload);
    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith({
      data: {
        power: payload.power,
      },
      where: {
        user_id: payload.user_id,
      },
    });
    expect(logout).not.toHaveBeenCalled();
    expect(logMethod).not.toHaveBeenCalled();
  });

  it('update user power failed with database disconnect error', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const update = jest.spyOn(prismaService.user, 'update').mockRejectedValue(PrismaDisconnectError);
    const logout = jest.spyOn(userService, 'logout');
    const updatePowerService = jest.spyOn(userService, 'updatePower');
    const updatePowerController = jest.spyOn(userController, 'updatePower');
    await expect(userController.updatePower(payload)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(PrismaDisconnectError.message))),
    );
    expect(updatePowerController).toHaveBeenCalledTimes(1);
    expect(updatePowerService).toHaveBeenCalledTimes(1);
    expect(updatePowerService).toHaveBeenCalledWith(payload);
    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith({
      data: {
        power: payload.power,
      },
      where: {
        user_id: payload.user_id,
      },
    });
    expect(logout).not.toHaveBeenCalled();
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(PrismaDisconnectError.message, expect.any(String));
  });

  it('update user power failed with logout got database disconnect error', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const update = jest.spyOn(prismaService.user, 'update').mockResolvedValue(user);
    const logout = jest.spyOn(userService, 'logout').mockImplementation(() => {
      throw new RpcException(new BadRequestException(PrismaDisconnectError.message));
    });
    const updatePowerService = jest.spyOn(userService, 'updatePower');
    const updatePowerController = jest.spyOn(userController, 'updatePower');
    await expect(userController.updatePower(payload)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(PrismaDisconnectError.message))),
    );
    expect(updatePowerController).toHaveBeenCalledTimes(1);
    expect(updatePowerService).toHaveBeenCalledTimes(1);
    expect(updatePowerService).toHaveBeenCalledWith(payload);
    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith({
      data: {
        power: payload.power,
      },
      where: {
        user_id: payload.user_id,
      },
    });
    expect(logout).toHaveBeenCalledTimes(1);
    expect(logout).toHaveBeenCalledWith(user.user_id);
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(PrismaDisconnectError.message, expect.any(String));
  });

  it('update user power failed with logout got unknown error', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const update = jest.spyOn(prismaService.user, 'update').mockResolvedValue(user);
    const logout = jest.spyOn(userService, 'logout').mockRejectedValue(UnknownError);
    const updatePowerService = jest.spyOn(userService, 'updatePower');
    const updatePowerController = jest.spyOn(userController, 'updatePower');
    await expect(userController.updatePower(payload)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(messages.COMMON.COMMON_ERROR))),
    );
    expect(updatePowerController).toHaveBeenCalledTimes(1);
    expect(updatePowerService).toHaveBeenCalledTimes(1);
    expect(updatePowerService).toHaveBeenCalledWith(payload);
    expect(update).toHaveBeenCalledWith({
      data: {
        power: payload.power,
      },
      where: {
        user_id: payload.user_id,
      },
    });
    expect(logout).toHaveBeenCalledTimes(1);
    expect(logout).toHaveBeenCalledWith(user.user_id);
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(UnknownError.message, expect.any(String));
  });

  it('update user power failed with logout got data not found error', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const update = jest.spyOn(prismaService.user, 'update').mockResolvedValue(user);
    const logout = jest.spyOn(userService, 'logout').mockImplementation(() => {
      throw new RpcException(new NotFoundException(messages.USER.NOT_FOUND));
    });
    const updatePowerService = jest.spyOn(userService, 'updatePower');
    const updatePowerController = jest.spyOn(userController, 'updatePower');
    await expect(userController.updatePower(payload)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(messages.USER.NOT_FOUND))),
    );
    expect(updatePowerController).toHaveBeenCalledTimes(1);
    expect(updatePowerService).toHaveBeenCalledTimes(1);
    expect(updatePowerService).toHaveBeenCalledWith(payload);
    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith({
      data: {
        power: payload.power,
      },
      where: {
        user_id: payload.user_id,
      },
    });
    expect(logout).toHaveBeenCalledTimes(1);
    expect(logout).toHaveBeenCalledWith(user.user_id);
    expect(logMethod).not.toHaveBeenCalled();
  });
});

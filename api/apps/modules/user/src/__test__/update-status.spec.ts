import { ClientProxy, RpcException } from '@nestjs/microservices';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaClient } from 'generated/prisma';
import LoggingService from '@share/libs/logging/logging.service';
import startUp from './pre-setup';
import { PRISMA_CLIENT, SOCKET_SERVICE } from '@share/di-token';
import UserController from '../user.controller';
import UserService from '../user.service';
import { user } from '@share/test/pre-setup/mock/data/user';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import { createMessage } from '@share/utils';
import messages from '@share/constants/messages';
import { PrismaDisconnectError } from '@share/test/pre-setup/mock/errors/prisma-errors';
import { updateUserCompletePattern } from '@share/pattern';

let prismaService: PrismaClient;
let loggerService: LoggingService;
let userController: UserController;
let userService: UserService;
let socketService: ClientProxy;

const payload: any = {
  user_id: user.user_id,
  active: user.active,
};

beforeAll(async () => {
  const moduleRef = await startUp();
  userService = moduleRef.get(UserService);
  userController = moduleRef.get(UserController);
  loggerService = moduleRef.get(LoggingService);
  prismaService = moduleRef.get(PRISMA_CLIENT);
  socketService = moduleRef.get(SOCKET_SERVICE);
});

describe('update user status', () => {
  it('update user status success', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const update = jest.spyOn(prismaService.user, 'update').mockResolvedValue(user);
    const logout = jest.spyOn(userService, 'logout').mockResolvedValue(null);
    const emit = jest.spyOn(socketService, 'emit').mockImplementation(jest.fn());
    const updateStatusService = jest.spyOn(userService, 'updateStatus');
    const updateStatusController = jest.spyOn(userController, 'updateStatus');
    await expect(userController.updateStatus(payload)).resolves.toBe(user);
    expect(updateStatusController).toHaveBeenCalledTimes(1);
    expect(updateStatusService).toHaveBeenCalledTimes(1);
    expect(updateStatusService).toHaveBeenCalledWith(payload);
    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith({
      data: {
        active: payload.active,
      },
      where: {
        user_id: payload.user_id,
      },
    });
    expect(logout).toHaveBeenCalledTimes(1);
    expect(logout).toHaveBeenCalledWith(payload.user_id);
    expect(emit).toHaveBeenCalledTimes(1);
    expect(emit).toHaveBeenCalledWith(updateUserCompletePattern, user.user_id);
    expect(logMethod).not.toHaveBeenCalled();
  });

  it('update user status failed with unknown error', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const update = jest.spyOn(prismaService.user, 'update').mockRejectedValue(UnknownError);
    const logout = jest.spyOn(userService, 'logout');
    const emit = jest.spyOn(socketService, 'emit').mockImplementation(jest.fn());
    const updateStatusService = jest.spyOn(userService, 'updateStatus');
    const updateStatusController = jest.spyOn(userController, 'updateStatus');
    await expect(userController.updateStatus(payload)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(messages.COMMON.COMMON_ERROR))),
    );
    expect(updateStatusController).toHaveBeenCalledTimes(1);
    expect(updateStatusService).toHaveBeenCalledTimes(1);
    expect(updateStatusService).toHaveBeenCalledWith(payload);
    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith({
      data: {
        active: payload.active,
      },
      where: {
        user_id: payload.user_id,
      },
    });
    expect(logout).not.toHaveBeenCalled();
    expect(emit).not.toHaveBeenCalled();
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(UnknownError.message, expect.any(String));
  });

  it('update user status failed with database disconnect error', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const update = jest.spyOn(prismaService.user, 'update').mockRejectedValue(PrismaDisconnectError);
    const logout = jest.spyOn(userService, 'logout');
    const emit = jest.spyOn(socketService, 'emit').mockImplementation(jest.fn());
    const updateStatusService = jest.spyOn(userService, 'updateStatus');
    const updateStatusController = jest.spyOn(userController, 'updateStatus');
    await expect(userController.updateStatus(payload)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(PrismaDisconnectError.message))),
    );
    expect(updateStatusController).toHaveBeenCalledTimes(1);
    expect(updateStatusService).toHaveBeenCalledTimes(1);
    expect(updateStatusService).toHaveBeenCalledWith(payload);
    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith({
      data: {
        active: payload.active,
      },
      where: {
        user_id: payload.user_id,
      },
    });
    expect(logout).not.toHaveBeenCalled();
    expect(emit).not.toHaveBeenCalled();
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(PrismaDisconnectError.message, expect.any(String));
  });

  it('update user status failed with sex invalid', async () => {
    expect.hasAssertions();
    const logout = jest.spyOn(userService, 'logout');
    const emit = jest.spyOn(socketService, 'emit').mockImplementation(jest.fn());
    const statusInvalidException = new BadRequestException(createMessage(messages.USER.YOUR_STATUS_INVALID));
    const logMethod = jest.spyOn(loggerService, 'error');
    const update = jest.spyOn(prismaService.user, 'update').mockRejectedValue(statusInvalidException);
    const updateStatusService = jest.spyOn(userService, 'updateStatus');
    const updateStatusController = jest.spyOn(userController, 'updateStatus');
    await expect(userController.updateStatus(payload)).rejects.toThrow(new RpcException(statusInvalidException));
    expect(updateStatusController).toHaveBeenCalledTimes(1);
    expect(updateStatusService).toHaveBeenCalledTimes(1);
    expect(updateStatusService).toHaveBeenCalledWith(payload);
    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith({
      data: {
        active: payload.active,
      },
      where: {
        user_id: payload.user_id,
      },
    });
    expect(logout).not.toHaveBeenCalled();
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(emit).not.toHaveBeenCalled();
    expect(logMethod).toHaveBeenCalledWith(messages.USER.YOUR_STATUS_INVALID, expect.any(String));
  });

  it('update user status failed with logout got database disconnect error', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const update = jest.spyOn(prismaService.user, 'update').mockResolvedValue(user);
    const logout = jest.spyOn(userService, 'logout').mockImplementation(() => {
      throw new RpcException(new BadRequestException(PrismaDisconnectError.message));
    });
    const emit = jest.spyOn(socketService, 'emit').mockImplementation(jest.fn());
    const updateStatusService = jest.spyOn(userService, 'updateStatus');
    const updateStatusController = jest.spyOn(userController, 'updateStatus');
    await expect(userController.updateStatus(payload)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(PrismaDisconnectError.message))),
    );
    expect(updateStatusController).toHaveBeenCalledTimes(1);
    expect(updateStatusService).toHaveBeenCalledTimes(1);
    expect(updateStatusService).toHaveBeenCalledWith(payload);
    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith({
      data: {
        active: payload.active,
      },
      where: {
        user_id: payload.user_id,
      },
    });
    expect(logout).toHaveBeenCalledTimes(1);
    expect(logout).toHaveBeenCalledWith(user.user_id);
    expect(emit).not.toHaveBeenCalled();
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(PrismaDisconnectError.message, expect.any(String));
  });

  it('update user status failed with logout got unknown error', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const update = jest.spyOn(prismaService.user, 'update').mockResolvedValue(user);
    const logout = jest.spyOn(userService, 'logout').mockRejectedValue(UnknownError);
    const emit = jest.spyOn(socketService, 'emit').mockImplementation(jest.fn());
    const updateStatusService = jest.spyOn(userService, 'updateStatus');
    const updateStatusController = jest.spyOn(userController, 'updateStatus');
    await expect(userController.updateStatus(payload)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(messages.COMMON.COMMON_ERROR))),
    );
    expect(updateStatusController).toHaveBeenCalledTimes(1);
    expect(updateStatusService).toHaveBeenCalledTimes(1);
    expect(updateStatusService).toHaveBeenCalledWith(payload);
    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith({
      data: {
        active: payload.active,
      },
      where: {
        user_id: payload.user_id,
      },
    });
    expect(logout).toHaveBeenCalledTimes(1);
    expect(logout).toHaveBeenCalledWith(user.user_id);
    expect(emit).not.toHaveBeenCalled();
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(UnknownError.message, expect.any(String));
  });

  it('update user status failed with logout got data not found error', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const update = jest.spyOn(prismaService.user, 'update').mockResolvedValue(user);
    const logout = jest.spyOn(userService, 'logout').mockImplementation(() => {
      throw new RpcException(new NotFoundException(messages.USER.NOT_FOUND));
    });
    const emit = jest.spyOn(socketService, 'emit').mockImplementation(jest.fn());
    const updateStatusService = jest.spyOn(userService, 'updateStatus');
    const updateStatusController = jest.spyOn(userController, 'updateStatus');
    await expect(userController.updateStatus(payload)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(messages.USER.NOT_FOUND))),
    );
    expect(updateStatusController).toHaveBeenCalledTimes(1);
    expect(updateStatusService).toHaveBeenCalledTimes(1);
    expect(updateStatusService).toHaveBeenCalledWith(payload);
    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith({
      data: {
        active: payload.active,
      },
      where: {
        user_id: payload.user_id,
      },
    });
    expect(logout).toHaveBeenCalledTimes(1);
    expect(logout).toHaveBeenCalledWith(user.user_id);
    expect(emit).not.toHaveBeenCalled();
    expect(logMethod).not.toHaveBeenCalled();
  });
});

import { BadRequestException, NotFoundException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaClient } from 'generated/prisma';
import startUp from './pre-setup';
import UserController from '../user.controller';
import UserService from '../user.service';
import { user } from '@share/test/pre-setup/mock/data/user';
import { bill } from '@share/test/pre-setup/mock/data/bill';
import { PRISMA_CLIENT } from '@share/di-token';
import LoggingService from '@share/libs/logging/logging.service';
import { PrismaDisconnectError, PrismaNotFoundError } from '@share/test/pre-setup/mock/errors/prisma-errors';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import messages from '@share/constants/messages';
import { createMessage } from '@share/utils';

let userController: UserController;
let userService: UserService;
let prismaService: PrismaClient;
let loggerService: LoggingService;
const userId = user.user_id;
const bills = [bill];
const billIds = bills.map((bill) => bill.bill_id);
const count = { count: 1 };

beforeAll(async () => {
  const moduleRef = await startUp();
  userService = moduleRef.get(UserService);
  userController = moduleRef.get(UserController);
  loggerService = moduleRef.get(LoggingService);
  prismaService = moduleRef.get(PRISMA_CLIENT);
});

describe('delete user', () => {
  it('delete user was success', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const findManyBillPrismaMethod = jest.spyOn(prismaService.bill, 'findMany').mockResolvedValue(bills);
    const deleteManyBillDetailPrismMethod = jest
      .spyOn(prismaService.bill_detail, 'deleteMany')
      .mockResolvedValue(count);
    const transaction = jest.spyOn(prismaService, '$transaction').mockResolvedValue([count, user]);
    const deleteManyBillPrismaMethod = jest.spyOn(prismaService.bill, 'deleteMany').mockImplementation(jest.fn());
    const deleteUserPrismaMethod = jest.spyOn(prismaService.user, 'delete').mockImplementation(jest.fn());
    const logout = jest.spyOn(userService, 'logout').mockResolvedValue(null);
    const deleteUserServiceMethod = jest.spyOn(userService, 'delete');
    const deleteUserControllerMethod = jest.spyOn(userController, 'delete');
    await expect(userController.delete(userId)).resolves.toBe(user);
    expect(deleteUserControllerMethod).toHaveBeenCalledTimes(1);
    expect(deleteUserControllerMethod).toHaveBeenCalledWith(userId);
    expect(deleteUserServiceMethod).toHaveBeenCalledTimes(1);
    expect(deleteUserServiceMethod).toHaveBeenCalledWith(userId);
    expect(findManyBillPrismaMethod).toHaveBeenCalledTimes(1);
    expect(findManyBillPrismaMethod).toHaveBeenLastCalledWith({
      where: {
        user_id: userId,
      },
      select: {
        bill_id: true,
      },
    });
    expect(deleteManyBillDetailPrismMethod).toHaveBeenCalledTimes(1);
    expect(deleteManyBillDetailPrismMethod).toHaveBeenCalledWith({
      where: {
        bill_id: {
          in: billIds,
        },
      },
    });
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(transaction).toHaveBeenCalledWith(expect.any(Array));
    expect(deleteManyBillPrismaMethod).toHaveBeenCalledTimes(1);
    expect(deleteManyBillPrismaMethod).toHaveBeenCalledWith({
      where: {
        user_id: userId,
      },
    });
    expect(deleteUserPrismaMethod).toHaveBeenCalledTimes(1);
    expect(deleteUserPrismaMethod).toHaveBeenCalledWith({
      where: {
        user_id: userId,
      },
      select: {
        session_id: true,
      },
    });
    expect(logout).toHaveBeenCalledTimes(1);
    expect(logout).toHaveBeenCalledWith(userId);
    expect(logMethod).not.toHaveBeenCalled();
  });

  it('delete user failed with findMany bill got not found error', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const findManyBillPrismaMethod = jest.spyOn(prismaService.bill, 'findMany').mockRejectedValue(PrismaNotFoundError);
    const deleteManyBillDetailPrismMethod = jest.spyOn(prismaService.bill_detail, 'deleteMany');
    const transaction = jest.spyOn(prismaService, '$transaction').mockResolvedValue([count, user]);
    const deleteManyBillPrismaMethod = jest.spyOn(prismaService.bill, 'deleteMany').mockImplementation(jest.fn());
    const deleteUserPrismaMethod = jest.spyOn(prismaService.user, 'delete').mockImplementation(jest.fn());
    const logout = jest.spyOn(userService, 'logout');
    const deleteUserServiceMethod = jest.spyOn(userService, 'delete');
    const deleteUserControllerMethod = jest.spyOn(userController, 'delete');
    await expect(userController.delete(userId)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(messages.USER.NOT_FOUND))),
    );
    expect(deleteUserControllerMethod).toHaveBeenCalledTimes(1);
    expect(deleteUserControllerMethod).toHaveBeenCalledWith(userId);
    expect(deleteUserServiceMethod).toHaveBeenCalledTimes(1);
    expect(deleteUserServiceMethod).toHaveBeenCalledWith(userId);
    expect(findManyBillPrismaMethod).toHaveBeenCalledTimes(1);
    expect(findManyBillPrismaMethod).toHaveBeenLastCalledWith({
      where: {
        user_id: userId,
      },
      select: {
        bill_id: true,
      },
    });
    expect(deleteManyBillDetailPrismMethod).not.toHaveBeenCalled();
    expect(transaction).not.toHaveBeenCalled();
    expect(logout).not.toHaveBeenCalled();
    expect(deleteManyBillPrismaMethod).not.toHaveBeenCalled();
    expect(deleteUserPrismaMethod).not.toHaveBeenCalled();
    expect(logMethod).not.toHaveBeenCalled();
  });

  it('delete user failed with deleteMany bill detail got not found error', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const findManyBillPrismaMethod = jest.spyOn(prismaService.bill, 'findMany').mockResolvedValue(bills);
    const deleteManyBillDetailPrismMethod = jest
      .spyOn(prismaService.bill_detail, 'deleteMany')
      .mockRejectedValue(PrismaNotFoundError);
    const transaction = jest.spyOn(prismaService, '$transaction').mockResolvedValue([count, user]);
    const deleteManyBillPrismaMethod = jest.spyOn(prismaService.bill, 'deleteMany').mockImplementation(jest.fn());
    const deleteUserPrismaMethod = jest.spyOn(prismaService.user, 'delete').mockImplementation(jest.fn());
    const deleteUserServiceMethod = jest.spyOn(userService, 'delete');
    const logout = jest.spyOn(userService, 'logout');
    const deleteUserControllerMethod = jest.spyOn(userController, 'delete');
    await expect(userController.delete(userId)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(messages.USER.NOT_FOUND))),
    );
    expect(deleteUserControllerMethod).toHaveBeenCalledTimes(1);
    expect(deleteUserControllerMethod).toHaveBeenCalledWith(userId);
    expect(deleteUserServiceMethod).toHaveBeenCalledTimes(1);
    expect(deleteUserServiceMethod).toHaveBeenCalledWith(userId);
    expect(findManyBillPrismaMethod).toHaveBeenCalledTimes(1);
    expect(findManyBillPrismaMethod).toHaveBeenLastCalledWith({
      where: {
        user_id: userId,
      },
      select: {
        bill_id: true,
      },
    });
    expect(deleteManyBillDetailPrismMethod).toHaveBeenCalledTimes(1);
    expect(deleteManyBillDetailPrismMethod).toHaveBeenCalledWith({
      where: {
        bill_id: {
          in: billIds,
        },
      },
    });
    expect(transaction).not.toHaveBeenCalled();
    expect(logout).not.toHaveBeenCalled();
    expect(deleteManyBillPrismaMethod).not.toHaveBeenCalled();
    expect(deleteUserPrismaMethod).not.toHaveBeenCalled();
    expect(logMethod).not.toHaveBeenCalled();
  });

  it('delete user failed with transaction got not found error', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const findManyBillPrismaMethod = jest.spyOn(prismaService.bill, 'findMany').mockResolvedValue(bills);
    const deleteManyBillDetailPrismMethod = jest
      .spyOn(prismaService.bill_detail, 'deleteMany')
      .mockResolvedValue(count);
    const transaction = jest.spyOn(prismaService, '$transaction').mockRejectedValue(PrismaNotFoundError);
    const deleteManyBillPrismaMethod = jest.spyOn(prismaService.bill, 'deleteMany');
    const deleteUserPrismaMethod = jest.spyOn(prismaService.user, 'delete');
    const deleteUserServiceMethod = jest.spyOn(userService, 'delete');
    const logout = jest.spyOn(userService, 'logout');
    const deleteUserControllerMethod = jest.spyOn(userController, 'delete');
    await expect(userController.delete(userId)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(messages.USER.NOT_FOUND))),
    );
    expect(deleteUserControllerMethod).toHaveBeenCalledTimes(1);
    expect(deleteUserControllerMethod).toHaveBeenCalledWith(userId);
    expect(deleteUserServiceMethod).toHaveBeenCalledTimes(1);
    expect(deleteUserServiceMethod).toHaveBeenCalledWith(userId);
    expect(findManyBillPrismaMethod).toHaveBeenCalledTimes(1);
    expect(findManyBillPrismaMethod).toHaveBeenLastCalledWith({
      where: {
        user_id: userId,
      },
      select: {
        bill_id: true,
      },
    });
    expect(deleteManyBillDetailPrismMethod).toHaveBeenCalledTimes(1);
    expect(deleteManyBillDetailPrismMethod).toHaveBeenCalledWith({
      where: {
        bill_id: {
          in: billIds,
        },
      },
    });
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(transaction).toHaveBeenCalledWith(expect.any(Array));
    expect(deleteManyBillPrismaMethod).toHaveBeenCalledTimes(1);
    expect(deleteManyBillPrismaMethod).toHaveBeenCalledWith({
      where: {
        user_id: userId,
      },
    });
    expect(deleteUserPrismaMethod).toHaveBeenCalledTimes(1);
    expect(deleteUserPrismaMethod).toHaveBeenCalledWith({
      where: {
        user_id: userId,
      },
      select: {
        session_id: true,
      },
    });
    expect(logout).not.toHaveBeenCalled();
    expect(logMethod).not.toHaveBeenCalled();
  });

  it('delete user failed with findMany bill got unknown error', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const findManyBillPrismaMethod = jest.spyOn(prismaService.bill, 'findMany').mockRejectedValue(UnknownError);
    const deleteManyBillDetailPrismMethod = jest.spyOn(prismaService.bill_detail, 'deleteMany');
    const transaction = jest.spyOn(prismaService, '$transaction').mockResolvedValue([count, user]);
    const deleteManyBillPrismaMethod = jest.spyOn(prismaService.bill, 'deleteMany').mockImplementation(jest.fn());
    const deleteUserPrismaMethod = jest.spyOn(prismaService.user, 'delete').mockImplementation(jest.fn());
    const logout = jest.spyOn(userService, 'logout');
    const deleteUserServiceMethod = jest.spyOn(userService, 'delete');
    const deleteUserControllerMethod = jest.spyOn(userController, 'delete');
    await expect(userController.delete(userId)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(messages.COMMON.COMMON_ERROR))),
    );
    expect(deleteUserControllerMethod).toHaveBeenCalledTimes(1);
    expect(deleteUserControllerMethod).toHaveBeenCalledWith(userId);
    expect(deleteUserServiceMethod).toHaveBeenCalledTimes(1);
    expect(deleteUserServiceMethod).toHaveBeenCalledWith(userId);
    expect(findManyBillPrismaMethod).toHaveBeenCalledTimes(1);
    expect(findManyBillPrismaMethod).toHaveBeenLastCalledWith({
      where: {
        user_id: userId,
      },
      select: {
        bill_id: true,
      },
    });
    expect(deleteManyBillDetailPrismMethod).not.toHaveBeenCalled();
    expect(transaction).not.toHaveBeenCalled();
    expect(deleteManyBillPrismaMethod).not.toHaveBeenCalled();
    expect(deleteUserPrismaMethod).not.toHaveBeenCalled();
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(UnknownError.message, expect.any(String));
    expect(logout).not.toHaveBeenCalled();
  });

  it('delete user failed with deleteMany bill got unknown error', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const findManyBillPrismaMethod = jest.spyOn(prismaService.bill, 'findMany').mockResolvedValue(bills);
    const deleteManyBillDetailPrismMethod = jest
      .spyOn(prismaService.bill_detail, 'deleteMany')
      .mockRejectedValue(UnknownError);
    const transaction = jest.spyOn(prismaService, '$transaction').mockResolvedValue([count, user]);
    const deleteManyBillPrismaMethod = jest.spyOn(prismaService.bill, 'deleteMany').mockImplementation(jest.fn());
    const deleteUserPrismaMethod = jest.spyOn(prismaService.user, 'delete').mockImplementation(jest.fn());
    const logout = jest.spyOn(userService, 'logout');
    const deleteUserServiceMethod = jest.spyOn(userService, 'delete');
    const deleteUserControllerMethod = jest.spyOn(userController, 'delete');
    await expect(userController.delete(userId)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(messages.COMMON.COMMON_ERROR))),
    );
    expect(deleteUserControllerMethod).toHaveBeenCalledTimes(1);
    expect(deleteUserControllerMethod).toHaveBeenCalledWith(userId);
    expect(deleteUserServiceMethod).toHaveBeenCalledTimes(1);
    expect(deleteUserServiceMethod).toHaveBeenCalledWith(userId);
    expect(findManyBillPrismaMethod).toHaveBeenCalledTimes(1);
    expect(findManyBillPrismaMethod).toHaveBeenLastCalledWith({
      where: {
        user_id: userId,
      },
      select: {
        bill_id: true,
      },
    });
    expect(deleteManyBillDetailPrismMethod).toHaveBeenCalledTimes(1);
    expect(deleteManyBillDetailPrismMethod).toHaveBeenCalledWith({
      where: {
        bill_id: {
          in: billIds,
        },
      },
    });
    expect(transaction).not.toHaveBeenCalled();
    expect(deleteManyBillPrismaMethod).not.toHaveBeenCalled();
    expect(deleteUserPrismaMethod).not.toHaveBeenCalled();
    expect(logout).not.toHaveBeenCalled();
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(UnknownError.message, expect.any(String));
  });

  it('delete user failed with transaction got unknown error', async () => {
    expect.hasAssertions();
    const logout = jest.spyOn(userService, 'logout');
    const logMethod = jest.spyOn(loggerService, 'error');
    const findManyBillPrismaMethod = jest.spyOn(prismaService.bill, 'findMany').mockResolvedValue(bills);
    const deleteManyBillDetailPrismMethod = jest
      .spyOn(prismaService.bill_detail, 'deleteMany')
      .mockResolvedValue(count);
    const transaction = jest.spyOn(prismaService, '$transaction').mockRejectedValue(UnknownError);
    const deleteManyBillPrismaMethod = jest.spyOn(prismaService.bill, 'deleteMany').mockImplementation(jest.fn());
    const deleteUserPrismaMethod = jest.spyOn(prismaService.user, 'delete').mockImplementation(jest.fn());
    const deleteUserServiceMethod = jest.spyOn(userService, 'delete');
    const deleteUserControllerMethod = jest.spyOn(userController, 'delete');
    await expect(userController.delete(userId)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(messages.COMMON.COMMON_ERROR))),
    );
    expect(deleteUserControllerMethod).toHaveBeenCalledTimes(1);
    expect(deleteUserControllerMethod).toHaveBeenCalledWith(userId);
    expect(deleteUserServiceMethod).toHaveBeenCalledTimes(1);
    expect(deleteUserServiceMethod).toHaveBeenCalledWith(userId);
    expect(findManyBillPrismaMethod).toHaveBeenCalledTimes(1);
    expect(findManyBillPrismaMethod).toHaveBeenLastCalledWith({
      where: {
        user_id: userId,
      },
      select: {
        bill_id: true,
      },
    });
    expect(deleteManyBillDetailPrismMethod).toHaveBeenCalledTimes(1);
    expect(deleteManyBillDetailPrismMethod).toHaveBeenCalledWith({
      where: {
        bill_id: {
          in: billIds,
        },
      },
    });
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(transaction).toHaveBeenCalledWith(expect.any(Array));
    expect(deleteManyBillPrismaMethod).toHaveBeenCalledTimes(1);
    expect(deleteManyBillPrismaMethod).toHaveBeenCalledWith({
      where: {
        user_id: userId,
      },
    });
    expect(deleteUserPrismaMethod).toHaveBeenCalledTimes(1);
    expect(deleteUserPrismaMethod).toHaveBeenCalledWith({
      where: {
        user_id: userId,
      },
      select: {
        session_id: true,
      },
    });
    expect(logout).not.toHaveBeenCalled();
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(UnknownError.message, expect.any(String));
  });

  it('delete user failed with database disconnect error', async () => {
    expect.hasAssertions();
    const logout = jest.spyOn(userService, 'logout');
    const logMethod = jest.spyOn(loggerService, 'error');
    const findManyBillPrismaMethod = jest
      .spyOn(prismaService.bill, 'findMany')
      .mockRejectedValue(PrismaDisconnectError);
    const deleteManyBillDetailPrismMethod = jest.spyOn(prismaService.bill_detail, 'deleteMany');
    const transaction = jest.spyOn(prismaService, '$transaction').mockResolvedValue([count, user]);
    const deleteManyBillPrismaMethod = jest.spyOn(prismaService.bill, 'deleteMany').mockImplementation(jest.fn());
    const deleteUserPrismaMethod = jest.spyOn(prismaService.user, 'delete').mockImplementation(jest.fn());
    const deleteUserServiceMethod = jest.spyOn(userService, 'delete');
    const deleteUserControllerMethod = jest.spyOn(userController, 'delete');
    await expect(userController.delete(userId)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(PrismaDisconnectError.message))),
    );
    expect(deleteUserControllerMethod).toHaveBeenCalledTimes(1);
    expect(deleteUserControllerMethod).toHaveBeenCalledWith(userId);
    expect(deleteUserServiceMethod).toHaveBeenCalledTimes(1);
    expect(deleteUserServiceMethod).toHaveBeenCalledWith(userId);
    expect(findManyBillPrismaMethod).toHaveBeenCalledTimes(1);
    expect(findManyBillPrismaMethod).toHaveBeenLastCalledWith({
      where: {
        user_id: userId,
      },
      select: {
        bill_id: true,
      },
    });
    expect(deleteManyBillDetailPrismMethod).not.toHaveBeenCalled();
    expect(transaction).not.toHaveBeenCalled();
    expect(deleteManyBillPrismaMethod).not.toHaveBeenCalled();
    expect(deleteUserPrismaMethod).not.toHaveBeenCalled();
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(PrismaDisconnectError.message, expect.any(String));
    expect(logout).not.toHaveBeenCalled();
  });

  it('delete user failed with logout got database disconnect error', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const findManyBillPrismaMethod = jest.spyOn(prismaService.bill, 'findMany').mockResolvedValue(bills);
    const deleteManyBillDetailPrismMethod = jest
      .spyOn(prismaService.bill_detail, 'deleteMany')
      .mockImplementation(jest.fn());
    const transaction = jest.spyOn(prismaService, '$transaction').mockResolvedValue([count, user]);
    const deleteManyBillPrismaMethod = jest.spyOn(prismaService.bill, 'deleteMany').mockImplementation(jest.fn());
    const deleteUserPrismaMethod = jest.spyOn(prismaService.user, 'delete').mockImplementation(jest.fn());
    const logout = jest.spyOn(userService, 'logout').mockImplementation(() => {
      throw new RpcException(new BadRequestException(PrismaDisconnectError.message));
    });
    const deleteUserServiceMethod = jest.spyOn(userService, 'delete');
    const deleteUserControllerMethod = jest.spyOn(userController, 'delete');
    await expect(userController.delete(userId)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(PrismaDisconnectError.message))),
    );
    expect(deleteUserControllerMethod).toHaveBeenCalledTimes(1);
    expect(deleteUserControllerMethod).toHaveBeenCalledWith(userId);
    expect(deleteUserServiceMethod).toHaveBeenCalledTimes(1);
    expect(deleteUserServiceMethod).toHaveBeenCalledWith(userId);
    expect(findManyBillPrismaMethod).toHaveBeenCalledTimes(1);
    expect(findManyBillPrismaMethod).toHaveBeenLastCalledWith({
      where: {
        user_id: userId,
      },
      select: {
        bill_id: true,
      },
    });
    expect(deleteManyBillDetailPrismMethod).toHaveBeenCalledTimes(1);
    expect(deleteManyBillDetailPrismMethod).toHaveBeenCalledWith({
      where: {
        bill_id: {
          in: billIds,
        },
      },
    });
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(transaction).toHaveBeenCalledWith(expect.any(Array));
    expect(deleteManyBillPrismaMethod).toHaveBeenCalledTimes(1);
    expect(deleteManyBillPrismaMethod).toHaveBeenCalledWith({
      where: {
        user_id: userId,
      },
    });
    expect(deleteUserPrismaMethod).toHaveBeenCalledTimes(1);
    expect(deleteUserPrismaMethod).toHaveBeenCalledWith({
      where: {
        user_id: userId,
      },
      select: {
        session_id: true,
      },
    });
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(PrismaDisconnectError.message, expect.any(String));
    expect(logout).toHaveBeenCalledTimes(1);
    expect(logout).toHaveBeenCalledWith(userId);
  });

  it('delete user failed with logout got unknown error', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const findManyBillPrismaMethod = jest.spyOn(prismaService.bill, 'findMany').mockResolvedValue(bills);
    const deleteManyBillDetailPrismMethod = jest
      .spyOn(prismaService.bill_detail, 'deleteMany')
      .mockImplementation(jest.fn());
    const transaction = jest.spyOn(prismaService, '$transaction').mockResolvedValue([count, user]);
    const deleteManyBillPrismaMethod = jest.spyOn(prismaService.bill, 'deleteMany').mockImplementation(jest.fn());
    const deleteUserPrismaMethod = jest.spyOn(prismaService.user, 'delete').mockImplementation(jest.fn());
    const logout = jest.spyOn(userService, 'logout').mockRejectedValue(UnknownError);
    const deleteUserServiceMethod = jest.spyOn(userService, 'delete');
    const deleteUserControllerMethod = jest.spyOn(userController, 'delete');
    await expect(userController.delete(userId)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(messages.COMMON.COMMON_ERROR))),
    );
    expect(deleteUserControllerMethod).toHaveBeenCalledTimes(1);
    expect(deleteUserControllerMethod).toHaveBeenCalledWith(userId);
    expect(deleteUserServiceMethod).toHaveBeenCalledTimes(1);
    expect(deleteUserServiceMethod).toHaveBeenCalledWith(userId);
    expect(findManyBillPrismaMethod).toHaveBeenCalledTimes(1);
    expect(findManyBillPrismaMethod).toHaveBeenLastCalledWith({
      where: {
        user_id: userId,
      },
      select: {
        bill_id: true,
      },
    });
    expect(deleteManyBillDetailPrismMethod).toHaveBeenCalledTimes(1);
    expect(deleteManyBillDetailPrismMethod).toHaveBeenCalledWith({
      where: {
        bill_id: {
          in: billIds,
        },
      },
    });
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(transaction).toHaveBeenCalledWith(expect.any(Array));
    expect(deleteManyBillPrismaMethod).toHaveBeenCalledTimes(1);
    expect(deleteManyBillPrismaMethod).toHaveBeenCalledWith({
      where: {
        user_id: userId,
      },
    });
    expect(deleteUserPrismaMethod).toHaveBeenCalledTimes(1);
    expect(deleteUserPrismaMethod).toHaveBeenCalledWith({
      where: {
        user_id: userId,
      },
      select: {
        session_id: true,
      },
    });
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(UnknownError.message, expect.any(String));
    expect(logout).toHaveBeenCalledTimes(1);
    expect(logout).toHaveBeenCalledWith(userId);
  });

  it('delete user failed with logout got not found error', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const findManyBillPrismaMethod = jest.spyOn(prismaService.bill, 'findMany').mockResolvedValue(bills);
    const deleteManyBillDetailPrismMethod = jest
      .spyOn(prismaService.bill_detail, 'deleteMany')
      .mockImplementation(jest.fn());
    const transaction = jest.spyOn(prismaService, '$transaction').mockResolvedValue([count, user]);
    const deleteManyBillPrismaMethod = jest.spyOn(prismaService.bill, 'deleteMany').mockImplementation(jest.fn());
    const deleteUserPrismaMethod = jest.spyOn(prismaService.user, 'delete').mockImplementation(jest.fn());
    const logout = jest.spyOn(userService, 'logout').mockImplementation(() => {
      throw new RpcException(new NotFoundException(messages.USER.NOT_FOUND));
    });
    const deleteUserServiceMethod = jest.spyOn(userService, 'delete');
    const deleteUserControllerMethod = jest.spyOn(userController, 'delete');
    await expect(userController.delete(userId)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(messages.USER.NOT_FOUND))),
    );
    expect(deleteUserControllerMethod).toHaveBeenCalledTimes(1);
    expect(deleteUserControllerMethod).toHaveBeenCalledWith(userId);
    expect(deleteUserServiceMethod).toHaveBeenCalledTimes(1);
    expect(deleteUserServiceMethod).toHaveBeenCalledWith(userId);
    expect(findManyBillPrismaMethod).toHaveBeenCalledTimes(1);
    expect(findManyBillPrismaMethod).toHaveBeenLastCalledWith({
      where: {
        user_id: userId,
      },
      select: {
        bill_id: true,
      },
    });
    expect(deleteManyBillDetailPrismMethod).toHaveBeenCalledTimes(1);
    expect(deleteManyBillDetailPrismMethod).toHaveBeenCalledWith({
      where: {
        bill_id: {
          in: billIds,
        },
      },
    });
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(transaction).toHaveBeenCalledWith(expect.any(Array));
    expect(deleteManyBillPrismaMethod).toHaveBeenCalledTimes(1);
    expect(deleteManyBillPrismaMethod).toHaveBeenCalledWith({
      where: {
        user_id: userId,
      },
    });
    expect(deleteUserPrismaMethod).toHaveBeenCalledTimes(1);
    expect(deleteUserPrismaMethod).toHaveBeenCalledWith({
      where: {
        user_id: userId,
      },
      select: {
        session_id: true,
      },
    });
    expect(logMethod).not.toHaveBeenCalled();
    expect(logout).toHaveBeenCalledTimes(1);
    expect(logout).toHaveBeenCalledWith(userId);
  });
});

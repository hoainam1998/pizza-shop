import { BadRequestException, NotFoundException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaClient } from 'generated/prisma';
import startUp from './pre-setup';
import UserController from '../user.controller';
import UserService from '../user.service';
import { user } from '@share/test/pre-setup/mock/data/user';
import { PRISMA_CLIENT } from '@share/di-token';
import LoggingService from '@share/libs/logging/logging.service';
import { PrismaDisconnectError, PrismaNotFoundError } from '@share/test/pre-setup/mock/errors/prisma-errors';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import messages from '@share/constants/messages';
import { createMessage } from '@share/utils';
import { UserDetailType } from '@share/interfaces';

let userController: UserController;
let userService: UserService;
let prismaService: PrismaClient;
let loggerService: LoggingService;

const query = {
  user_id: true,
  first_name: true,
  last_name: true,
  phone: true,
  email: true,
  sex: true,
  power: true,
  avatar: true,
};

const getUserBody: UserDetailType = {
  user_id: user.user_id,
  query,
};

beforeAll(async () => {
  const moduleRef = await startUp();
  userService = moduleRef.get(UserService);
  userController = moduleRef.get(UserController);
  loggerService = moduleRef.get(LoggingService);
  prismaService = moduleRef.get(PRISMA_CLIENT);
});

describe('get user', () => {
  it('get user was success', async () => {
    expect.hasAssertions();
    const findUniqueOrThrowPrismaMethod = jest.spyOn(prismaService.user, 'findUniqueOrThrow').mockResolvedValue(user);
    const getDetailServiceMethod = jest.spyOn(userService, 'getUser');
    const getAllControllerMethod = jest.spyOn(userController, 'getUser');
    await expect(userController.getUser(getUserBody)).resolves.toBe(user);
    expect(getAllControllerMethod).toHaveBeenCalledTimes(1);
    expect(getAllControllerMethod).toHaveBeenCalledWith(getUserBody);
    expect(getDetailServiceMethod).toHaveBeenCalledTimes(1);
    expect(getDetailServiceMethod).toHaveBeenCalledWith(getUserBody);
    expect(findUniqueOrThrowPrismaMethod).toHaveBeenCalledTimes(1);
    expect(findUniqueOrThrowPrismaMethod).toHaveBeenLastCalledWith({
      where: {
        user_id: getUserBody.user_id,
      },
      select: getUserBody.query,
    });
  });

  it('get user failed with not found error', async () => {
    expect.hasAssertions();
    const findUniqueOrThrowPrismaMethod = jest
      .spyOn(prismaService.user, 'findUniqueOrThrow')
      .mockRejectedValue(PrismaNotFoundError);
    const logMethod = jest.spyOn(loggerService, 'error');
    const getDetailServiceMethod = jest.spyOn(userService, 'getUser');
    const getAllControllerMethod = jest.spyOn(userController, 'getUser');
    await expect(userController.getUser(getUserBody)).rejects.toThrow(
      new RpcException(new NotFoundException(messages.USER.NOT_FOUND)),
    );
    expect(getAllControllerMethod).toHaveBeenCalledTimes(1);
    expect(getAllControllerMethod).toHaveBeenCalledWith(getUserBody);
    expect(logMethod).not.toHaveBeenCalled();
    expect(getDetailServiceMethod).toHaveBeenCalledTimes(1);
    expect(getDetailServiceMethod).toHaveBeenCalledWith(getUserBody);
    expect(findUniqueOrThrowPrismaMethod).toHaveBeenCalledTimes(1);
    expect(findUniqueOrThrowPrismaMethod).toHaveBeenLastCalledWith({
      where: {
        user_id: getUserBody.user_id,
      },
      select: getUserBody.query,
    });
  });

  it('get user failed with unknown error', async () => {
    expect.hasAssertions();
    const findUniqueOrThrowPrismaMethod = jest
      .spyOn(prismaService.user, 'findUniqueOrThrow')
      .mockRejectedValue(UnknownError);
    const logMethod = jest.spyOn(loggerService, 'error');
    const getDetailServiceMethod = jest.spyOn(userService, 'getUser');
    const getAllControllerMethod = jest.spyOn(userController, 'getUser');
    await expect(userController.getUser(getUserBody)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(messages.COMMON.COMMON_ERROR))),
    );
    expect(getAllControllerMethod).toHaveBeenCalledTimes(1);
    expect(getAllControllerMethod).toHaveBeenCalledWith(getUserBody);
    expect(logMethod).toHaveBeenCalledWith(UnknownError.message, expect.any(String));
    expect(getDetailServiceMethod).toHaveBeenCalledTimes(1);
    expect(getDetailServiceMethod).toHaveBeenCalledWith(getUserBody);
    expect(findUniqueOrThrowPrismaMethod).toHaveBeenCalledTimes(1);
    expect(findUniqueOrThrowPrismaMethod).toHaveBeenLastCalledWith({
      where: {
        user_id: getUserBody.user_id,
      },
      select: getUserBody.query,
    });
  });

  it('get user failed with database disconnect error', async () => {
    expect.hasAssertions();
    const findUniqueOrThrowPrismaMethod = jest
      .spyOn(prismaService.user, 'findUniqueOrThrow')
      .mockRejectedValue(PrismaDisconnectError);
    const logMethod = jest.spyOn(loggerService, 'error');
    const getDetailServiceMethod = jest.spyOn(userService, 'getUser');
    const getAllControllerMethod = jest.spyOn(userController, 'getUser');
    await expect(userController.getUser(getUserBody)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(PrismaDisconnectError.message))),
    );
    expect(getAllControllerMethod).toHaveBeenCalledTimes(1);
    expect(getAllControllerMethod).toHaveBeenCalledWith(getUserBody);
    expect(logMethod).toHaveBeenCalledWith(PrismaDisconnectError.message, expect.any(String));
    expect(getDetailServiceMethod).toHaveBeenCalledTimes(1);
    expect(getDetailServiceMethod).toHaveBeenCalledWith(getUserBody);
    expect(findUniqueOrThrowPrismaMethod).toHaveBeenCalledTimes(1);
    expect(findUniqueOrThrowPrismaMethod).toHaveBeenLastCalledWith({
      where: {
        user_id: getUserBody.user_id,
      },
      select: getUserBody.query,
    });
  });
});

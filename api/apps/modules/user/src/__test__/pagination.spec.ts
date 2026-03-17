import { BadRequestException, NotFoundException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaClient } from 'generated/prisma';
import startUp from './pre-setup';
import UserController from '../user.controller';
import UserService from '../user.service';
import { PRISMA_CLIENT } from '@share/di-token';
import LoggingService from '@share/libs/logging/logging.service';
import { calcSkip, createMessage } from '@share/utils';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import messages from '@share/constants/messages';
import { PrismaDisconnectError } from '@share/test/pre-setup/mock/errors/prisma-errors';
import { createUsers, user } from '@share/test/pre-setup/mock/data/user';

let userController: UserController;
let userService: UserService;
let prismaService: PrismaClient;
let loggerService: LoggingService;

const query = {
  user_id: true,
  fist_name: true,
  last_name: true,
  phone: true,
  email: true,
  sex: true,
  power: true,
};

const paginationBody: any = {
  pageSize: 10,
  pageNumber: 1,
  query,
};
const length = 2;
const users = createUsers(length);
const skip = calcSkip(+paginationBody.pageSize, +paginationBody.pageNumber);

beforeAll(async () => {
  const moduleRef = await startUp();
  userService = moduleRef.get(UserService);
  userController = moduleRef.get(UserController);
  loggerService = moduleRef.get(LoggingService);
  prismaService = moduleRef.get(PRISMA_CLIENT);
});

describe('user pagination', () => {
  it('user pagination was success', async () => {
    expect.hasAssertions();
    const transactionResults = [users, length];
    const findManyPrismaMethod = jest.spyOn(prismaService.user, 'findMany');
    const countPrismaMethod = jest.spyOn(prismaService.user, 'count');
    const transactionPrismaMethod = jest.spyOn(prismaService, '$transaction').mockResolvedValue(transactionResults);
    const paginationServiceMethod = jest.spyOn(userService, 'pagination');
    const paginationControllerMethod = jest.spyOn(userController, 'pagination');
    await expect(userController.pagination(paginationBody)).resolves.toEqual({
      list: transactionResults[0],
      total: transactionResults[1],
    });
    expect(paginationControllerMethod).toHaveBeenCalledTimes(1);
    expect(paginationControllerMethod).toHaveBeenCalledWith(paginationBody);
    expect(paginationServiceMethod).toHaveBeenCalledTimes(1);
    expect(paginationServiceMethod).toHaveBeenCalledWith(paginationBody);
    expect(transactionPrismaMethod).toHaveBeenCalledTimes(1);
    expect(transactionPrismaMethod).toHaveBeenCalledWith(expect.any(Array));
    expect(findManyPrismaMethod).toHaveBeenCalledTimes(1);
    expect(findManyPrismaMethod).toHaveBeenCalledWith({
      select: paginationBody.query,
      take: paginationBody.pageSize,
      skip,
      where: {},
      orderBy: {
        user_id: 'desc',
      },
    });
    expect(countPrismaMethod).toHaveBeenCalledTimes(1);
    expect(countPrismaMethod).toHaveBeenCalledWith({ where: {} });
  });

  it('user pagination was success with keyword', async () => {
    expect.hasAssertions();
    const paginationBodyWithKeyword = {
      ...paginationBody,
      search: user.last_name,
    };
    const transactionResults = [users, length];
    const findManyPrismaMethod = jest.spyOn(prismaService.user, 'findMany');
    const countPrismaMethod = jest.spyOn(prismaService.user, 'count');
    const transactionPrismaMethod = jest.spyOn(prismaService, '$transaction').mockResolvedValue(transactionResults);
    const paginationServiceMethod = jest.spyOn(userService, 'pagination');
    const paginationControllerMethod = jest.spyOn(userController, 'pagination');
    await expect(userController.pagination(paginationBodyWithKeyword)).resolves.toEqual({
      list: transactionResults[0],
      total: transactionResults[1],
    });
    expect(paginationControllerMethod).toHaveBeenCalledTimes(1);
    expect(paginationControllerMethod).toHaveBeenCalledWith(paginationBodyWithKeyword);
    expect(paginationServiceMethod).toHaveBeenCalledTimes(1);
    expect(paginationServiceMethod).toHaveBeenCalledWith(paginationBodyWithKeyword);
    expect(transactionPrismaMethod).toHaveBeenCalledTimes(1);
    expect(transactionPrismaMethod).toHaveBeenCalledWith(expect.any(Array));
    expect(findManyPrismaMethod).toHaveBeenCalledTimes(1);
    expect(findManyPrismaMethod).toHaveBeenCalledWith({
      select: paginationBodyWithKeyword.query,
      take: paginationBodyWithKeyword.pageSize,
      skip,
      where: {
        OR: [
          {
            first_name: {
              contains: paginationBodyWithKeyword.search,
            },
          },
          {
            last_name: {
              contains: paginationBodyWithKeyword.search,
            },
          },
        ],
      },
      orderBy: {
        user_id: 'desc',
      },
    });
    expect(countPrismaMethod).toHaveBeenCalledTimes(1);
    expect(countPrismaMethod).toHaveBeenCalledWith({
      where: {
        OR: [
          {
            first_name: {
              contains: paginationBodyWithKeyword.search,
            },
          },
          {
            last_name: {
              contains: paginationBodyWithKeyword.search,
            },
          },
        ],
      },
    });
  });

  it('user pagination failed with not found error', async () => {
    expect.hasAssertions();
    const findManyPrismaMethod = jest.spyOn(prismaService.user, 'findMany');
    const countPrismaMethod = jest.spyOn(prismaService.user, 'count');
    const transactionPrismaMethod = jest.spyOn(prismaService, '$transaction').mockResolvedValue([[], 0]);
    const paginationServiceMethod = jest.spyOn(userService, 'pagination');
    const paginationControllerMethod = jest.spyOn(userController, 'pagination');
    await expect(userController.pagination(paginationBody)).rejects.toThrow(
      new RpcException(
        new NotFoundException({
          list: [],
          total: 0,
        }),
      ),
    );
    expect(paginationControllerMethod).toHaveBeenCalledTimes(1);
    expect(paginationControllerMethod).toHaveBeenCalledWith(paginationBody);
    expect(paginationServiceMethod).toHaveBeenCalledTimes(1);
    expect(paginationServiceMethod).toHaveBeenCalledWith(paginationBody);
    expect(transactionPrismaMethod).toHaveBeenCalledTimes(1);
    expect(transactionPrismaMethod).toHaveBeenCalledWith(expect.any(Array));
    expect(findManyPrismaMethod).toHaveBeenCalledTimes(1);
    expect(findManyPrismaMethod).toHaveBeenCalledWith({
      select: paginationBody.query,
      take: paginationBody.pageSize,
      skip,
      where: {},
      orderBy: {
        user_id: 'desc',
      },
    });
    expect(countPrismaMethod).toHaveBeenCalledTimes(1);
    expect(countPrismaMethod).toHaveBeenCalledWith({ where: {} });
  });

  it('user pagination failed with unknown error', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const findManyPrismaMethod = jest.spyOn(prismaService.user, 'findMany');
    const countPrismaMethod = jest.spyOn(prismaService.user, 'count');
    const transactionPrismaMethod = jest.spyOn(prismaService, '$transaction').mockRejectedValue(UnknownError);
    const paginationServiceMethod = jest.spyOn(userService, 'pagination');
    const paginationControllerMethod = jest.spyOn(userController, 'pagination');
    await expect(userController.pagination(paginationBody)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(messages.COMMON.COMMON_ERROR))),
    );
    expect(paginationControllerMethod).toHaveBeenCalledTimes(1);
    expect(paginationControllerMethod).toHaveBeenCalledWith(paginationBody);
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(UnknownError.message, expect.any(String));
    expect(paginationServiceMethod).toHaveBeenCalledTimes(1);
    expect(paginationServiceMethod).toHaveBeenCalledWith(paginationBody);
    expect(transactionPrismaMethod).toHaveBeenCalledTimes(1);
    expect(transactionPrismaMethod).toHaveBeenCalledWith(expect.any(Array));
    expect(findManyPrismaMethod).toHaveBeenCalledTimes(1);
    expect(findManyPrismaMethod).toHaveBeenCalledWith({
      select: paginationBody.query,
      take: paginationBody.pageSize,
      skip,
      where: {},
      orderBy: {
        user_id: 'desc',
      },
    });
    expect(countPrismaMethod).toHaveBeenCalledTimes(1);
    expect(countPrismaMethod).toHaveBeenCalledWith({ where: {} });
  });

  it('user pagination failed with database disconnect error', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const findManyPrismaMethod = jest.spyOn(prismaService.user, 'findMany');
    const countPrismaMethod = jest.spyOn(prismaService.user, 'count');
    const transactionPrismaMethod = jest.spyOn(prismaService, '$transaction').mockRejectedValue(PrismaDisconnectError);
    const paginationServiceMethod = jest.spyOn(userService, 'pagination');
    const paginationControllerMethod = jest.spyOn(userController, 'pagination');
    await expect(userController.pagination(paginationBody)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(PrismaDisconnectError.message))),
    );
    expect(paginationControllerMethod).toHaveBeenCalledTimes(1);
    expect(paginationControllerMethod).toHaveBeenCalledWith(paginationBody);
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(PrismaDisconnectError.message, expect.any(String));
    expect(paginationServiceMethod).toHaveBeenCalledTimes(1);
    expect(paginationServiceMethod).toHaveBeenCalledWith(paginationBody);
    expect(transactionPrismaMethod).toHaveBeenCalledTimes(1);
    expect(transactionPrismaMethod).toHaveBeenCalledWith(expect.any(Array));
    expect(findManyPrismaMethod).toHaveBeenCalledTimes(1);
    expect(findManyPrismaMethod).toHaveBeenCalledWith({
      select: paginationBody.query,
      take: paginationBody.pageSize,
      skip,
      where: {},
      orderBy: {
        user_id: 'desc',
      },
    });
    expect(countPrismaMethod).toHaveBeenCalledTimes(1);
    expect(countPrismaMethod).toHaveBeenCalledWith({ where: {} });
  });
});

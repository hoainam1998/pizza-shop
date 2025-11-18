import LoggingService from '@share/libs/logging/logging.service';
import startUp from './pre-setup';
import { PRISMA_CLIENT } from '@share/di-token';
import { PrismaClient } from 'generated/prisma';
import UserController from '../user.controller';
import UserService from '../user.service';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import { RpcException } from '@nestjs/microservices';
import { BadRequestException } from '@nestjs/common';
import { createMessage } from '@share/utils';
import messages from '@share/constants/messages';
import { PrismaDisconnectError } from '@share/test/pre-setup/mock/errors/prisma-errors';

let prismaService: PrismaClient;
let loggerService: LoggingService;
let userController: UserController;
let userService: UserService;
const countResult = 1;

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

describe('can signup', () => {
  it('can signup success', async () => {
    expect.hasAssertions();
    const count = jest.spyOn(prismaService.user, 'count').mockResolvedValue(countResult);
    const canSignupService = jest.spyOn(userService, 'canSignup');
    const canSignupController = jest.spyOn(userController, 'canSignup');
    await expect(userController.canSignup()).resolves.toBe(countResult);
    expect(canSignupController).toHaveBeenCalledTimes(1);
    expect(canSignupService).toHaveBeenCalledTimes(1);
    expect(count).toHaveBeenCalledTimes(1);
  });

  it('can signup failed with unknown error', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const count = jest.spyOn(prismaService.user, 'count').mockRejectedValue(UnknownError);
    const canSignupService = jest.spyOn(userService, 'canSignup');
    const canSignupController = jest.spyOn(userController, 'canSignup');
    await expect(userController.canSignup()).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(messages.COMMON.COMMON_ERROR))),
    );
    expect(canSignupController).toHaveBeenCalledTimes(1);
    expect(canSignupService).toHaveBeenCalledTimes(1);
    expect(count).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(UnknownError.message, expect.any(String));
  });

  it('can signup failed with database disconnect error', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const count = jest.spyOn(prismaService.user, 'count').mockRejectedValue(PrismaDisconnectError);
    const canSignupService = jest.spyOn(userService, 'canSignup');
    const canSignupController = jest.spyOn(userController, 'canSignup');
    await expect(userController.canSignup()).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(PrismaDisconnectError.message))),
    );
    expect(canSignupController).toHaveBeenCalledTimes(1);
    expect(canSignupService).toHaveBeenCalledTimes(1);
    expect(count).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(PrismaDisconnectError.message, expect.any(String));
  });
});

import { PrismaClient } from 'generated/prisma';
import startUp from './pre-setup';
import { PRISMA_CLIENT } from '@share/di-token';
import UserService from '../user.service';
import { user } from '@share/test/pre-setup/mock/data/user';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import { autoGeneratePassword } from '@share/utils';
import { PrismaDisconnectError, PrismaNotFoundError } from '@share/test/pre-setup/mock/errors/prisma-errors';
import { RpcException } from '@nestjs/microservices';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import messages from '@share/constants/messages';

let prismaService: PrismaClient;
let userService: UserService;
const sessionId = autoGeneratePassword();
const userId = user.user_id;

beforeAll(async () => {
  const moduleRef = await startUp();
  userService = moduleRef.get(UserService);
  prismaService = moduleRef.get(PRISMA_CLIENT);
});

describe('update user session id', () => {
  it('update user session id success', async () => {
    expect.hasAssertions();
    const update = jest.spyOn(prismaService.user, 'update').mockResolvedValue(user);
    const updateUserSessionIdService = jest.spyOn(userService, 'updateUserSessionId');
    await expect(userService.updateUserSessionId(userId, sessionId)).resolves.toEqual(user);
    expect(updateUserSessionIdService).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith({
      where: {
        user_id: userId,
      },
      data: {
        session_id: sessionId,
      },
    });
  });

  it('update user failed with unknown error', async () => {
    expect.hasAssertions();
    const update = jest.spyOn(prismaService.user, 'update').mockRejectedValue(UnknownError);
    const updateUserSessionIdService = jest.spyOn(userService, 'updateUserSessionId');
    await expect(userService.updateUserSessionId(userId, sessionId)).rejects.toThrow(UnknownError);
    expect(updateUserSessionIdService).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith({
      where: {
        user_id: userId,
      },
      data: {
        session_id: sessionId,
      },
    });
  });

  it('update user failed with not found error', async () => {
    expect.hasAssertions();
    const update = jest.spyOn(prismaService.user, 'update').mockRejectedValue(PrismaNotFoundError);
    const updateUserSessionIdService = jest.spyOn(userService, 'updateUserSessionId');
    await expect(userService.updateUserSessionId(userId, sessionId)).rejects.toThrow(
      new RpcException(new NotFoundException(messages.USER.NOT_FOUND)),
    );
    expect(updateUserSessionIdService).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith({
      where: {
        user_id: userId,
      },
      data: {
        session_id: sessionId,
      },
    });
  });

  it('update user failed with database disconnect error', async () => {
    expect.hasAssertions();
    const update = jest.spyOn(prismaService.user, 'update').mockRejectedValue(PrismaDisconnectError);
    const updateUserSessionIdService = jest.spyOn(userService, 'updateUserSessionId');
    await expect(userService.updateUserSessionId(userId, sessionId)).rejects.toThrow(
      new RpcException(new BadRequestException(PrismaDisconnectError.message)),
    );
    expect(updateUserSessionIdService).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith({
      where: {
        user_id: userId,
      },
      data: {
        session_id: sessionId,
      },
    });
  });
});

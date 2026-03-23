import { RpcException } from '@nestjs/microservices';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaClient } from 'generated/prisma';
import startUp from './pre-setup';
import { PRISMA_CLIENT } from '@share/di-token';
import UserService from '../user.service';
import { user } from '@share/test/pre-setup/mock/data/user';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import { createMessage } from '@share/utils';
import messages from '@share/constants/messages';
import { PrismaDisconnectError, PrismaNotFoundError } from '@share/test/pre-setup/mock/errors/prisma-errors';

let prismaService: PrismaClient;
let userService: UserService;

beforeAll(async () => {
  const moduleRef = await startUp();
  userService = moduleRef.get(UserService);
  prismaService = moduleRef.get(PRISMA_CLIENT);
});

describe('login service', () => {
  it('login service success', async () => {
    expect.hasAssertions();
    const findUniqueOrThrow = jest.spyOn(prismaService.user, 'findUniqueOrThrow').mockResolvedValue(user);
    const loginService = jest.spyOn(userService, 'login');
    await expect(userService.login(user.email)).resolves.toEqual(user);
    expect(loginService).toHaveBeenCalledTimes(1);
    expect(findUniqueOrThrow).toHaveBeenCalledTimes(1);
    expect(findUniqueOrThrow).toHaveBeenCalledWith({
      where: {
        email: user.email,
      },
      omit: {
        phone: true,
      },
    });
  });

  it('login service failed with unknown error', async () => {
    expect.hasAssertions();
    const findUniqueOrThrow = jest.spyOn(prismaService.user, 'findUniqueOrThrow').mockRejectedValue(UnknownError);
    const loginService = jest.spyOn(userService, 'login');
    await expect(userService.login(user.email)).rejects.toThrow(UnknownError);
    expect(loginService).toHaveBeenCalledTimes(1);
    expect(findUniqueOrThrow).toHaveBeenCalledTimes(1);
    expect(findUniqueOrThrow).toHaveBeenCalledWith({
      where: {
        email: user.email,
      },
      omit: {
        phone: true,
      },
    });
  });

  it('login failed with not found error', async () => {
    expect.hasAssertions();
    const findUniqueOrThrow = jest
      .spyOn(prismaService.user, 'findUniqueOrThrow')
      .mockRejectedValue(PrismaNotFoundError);
    const loginService = jest.spyOn(userService, 'login');
    await expect(userService.login(user.email)).rejects.toThrow(
      new RpcException(new NotFoundException(messages.USER.NOT_FOUND)),
    );
    expect(loginService).toHaveBeenCalledTimes(1);
    expect(findUniqueOrThrow).toHaveBeenCalledTimes(1);
    expect(findUniqueOrThrow).toHaveBeenCalledWith({
      where: {
        email: user.email,
      },
      omit: {
        phone: true,
      },
    });
  });

  it('login failed failed with database disconnect error', async () => {
    expect.hasAssertions();
    const findUniqueOrThrow = jest
      .spyOn(prismaService.user, 'findUniqueOrThrow')
      .mockRejectedValue(PrismaDisconnectError);
    const loginService = jest.spyOn(userService, 'login');
    await expect(userService.login(user.email)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(PrismaDisconnectError.message))),
    );
    expect(loginService).toHaveBeenCalledTimes(1);
    expect(findUniqueOrThrow).toHaveBeenCalledTimes(1);
    expect(findUniqueOrThrow).toHaveBeenCalledTimes(1);
    expect(findUniqueOrThrow).toHaveBeenCalledWith({
      where: {
        email: user.email,
      },
      omit: {
        phone: true,
      },
    });
  });
});

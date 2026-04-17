import { RpcException } from '@nestjs/microservices';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaClient } from 'generated/prisma';
import startUp from './pre-setup';
import { PRISMA_CLIENT } from '@share/di-token';
import UserService from '../user.service';
import { user as originUser } from '@share/test/pre-setup/mock/data/user';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import messages from '@share/constants/messages';
import { PrismaDisconnectError, PrismaNotFoundError } from '@share/test/pre-setup/mock/errors/prisma-errors';
import { ResetPassword } from '@share/dto/validators/user.dto';
import { APP_NAME } from '@share/enums';

const user: Omit<typeof originUser, 'reset_password_link'> & {
  reset_password_link?: string;
} = originUser;

let prismaService: PrismaClient;
let userService: UserService;

const resetPasswordBody: ResetPassword = {
  email: user.email,
  password: user.password,
  oldPassword: expect.any(String),
  token: user.reset_password_token,
  by: APP_NAME.ADMIN,
};

beforeAll(async () => {
  const moduleRef = await startUp();
  userService = moduleRef.get(UserService);
  prismaService = moduleRef.get(PRISMA_CLIENT);
});

describe('reset password service', () => {
  it('reset password service success', async () => {
    expect.hasAssertions();
    const update = jest.spyOn(prismaService.user, 'update').mockResolvedValue(user);
    const resetPassword = jest.spyOn(userService, 'resetPassword');
    await expect(userService.resetPassword(resetPasswordBody)).resolves.toEqual(user);
    expect(resetPassword).toHaveBeenCalledTimes(1);
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

  it('reset password service got not found error', async () => {
    expect.hasAssertions();
    const update = jest.spyOn(prismaService.user, 'update').mockRejectedValue(PrismaNotFoundError);
    const resetPassword = jest.spyOn(userService, 'resetPassword');
    await expect(userService.resetPassword(resetPasswordBody)).rejects.toThrow(
      new RpcException(new UnauthorizedException(messages.USER.NOT_FOUND)),
    );
    expect(resetPassword).toHaveBeenCalledTimes(1);
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

  it('reset password service got unknown error', async () => {
    expect.hasAssertions();
    const update = jest.spyOn(prismaService.user, 'update').mockRejectedValue(UnknownError);
    const resetPassword = jest.spyOn(userService, 'resetPassword');
    await expect(userService.resetPassword(resetPasswordBody)).rejects.toThrow(UnknownError);
    expect(resetPassword).toHaveBeenCalledTimes(1);
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

  it('reset password service got database disconnect error', async () => {
    expect.hasAssertions();
    const update = jest.spyOn(prismaService.user, 'update').mockRejectedValue(PrismaDisconnectError);
    const resetPassword = jest.spyOn(userService, 'resetPassword');
    await expect(userService.resetPassword(resetPasswordBody)).rejects.toThrow(
      new RpcException(new BadRequestException(PrismaDisconnectError.message)),
    );
    expect(resetPassword).toHaveBeenCalledTimes(1);
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
});

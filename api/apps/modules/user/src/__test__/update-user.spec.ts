import { RpcException } from '@nestjs/microservices';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
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
import { PrismaDisconnectError } from '@share/test/pre-setup/mock/errors/prisma-errors';

let prismaService: PrismaClient;
let loggerService: LoggingService;
let userController: UserController;
let userService: UserService;

const userInput: any = {
  user_id: user.user_id,
  first_name: user.first_name,
  last_name: user.last_name,
  email: user.email,
  phone: user.phone,
  sex: user.sex,
  power: user.power,
};

beforeAll(async () => {
  const moduleRef = await startUp();

  userService = moduleRef.get(UserService);
  userController = moduleRef.get(UserController);
  loggerService = moduleRef.get(LoggingService);
  prismaService = moduleRef.get(PRISMA_CLIENT);
});

describe('update user', () => {
  it('update user success', async () => {
    expect.hasAssertions();
    const update = jest.spyOn(prismaService.user, 'update').mockResolvedValue(user);
    const updateService = jest.spyOn(userService, 'update');
    const updateController = jest.spyOn(userController, 'update');
    await expect(userController.update(userInput)).resolves.toBe(user);
    expect(updateController).toHaveBeenCalledTimes(1);
    expect(updateService).toHaveBeenCalledTimes(1);
    expect(updateService).toHaveBeenCalledWith(userInput);
    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith({
      data: userInput,
      where: {
        user_id: userInput.user_id,
      },
    });
  });

  it('update user failed with unknown error', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const update = jest.spyOn(prismaService.user, 'update').mockRejectedValue(UnknownError);
    const updateService = jest.spyOn(userService, 'update');
    const updateController = jest.spyOn(userController, 'update');
    await expect(userController.update(userInput)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(messages.COMMON.COMMON_ERROR))),
    );
    expect(updateController).toHaveBeenCalledTimes(1);
    expect(updateService).toHaveBeenCalledTimes(1);
    expect(updateService).toHaveBeenCalledWith(userInput);
    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith({
      data: userInput,
      where: {
        user_id: userInput.user_id,
      },
    });
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(UnknownError.message, expect.any(String));
  });

  it('update user failed with database disconnect error', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const update = jest.spyOn(prismaService.user, 'update').mockRejectedValue(PrismaDisconnectError);
    const updateService = jest.spyOn(userService, 'update');
    const updateController = jest.spyOn(userController, 'update');
    await expect(userController.update(userInput)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(PrismaDisconnectError.message))),
    );
    expect(updateController).toHaveBeenCalledTimes(1);
    expect(updateService).toHaveBeenCalledTimes(1);
    expect(updateService).toHaveBeenCalledWith(userInput);
    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith({
      data: userInput,
      where: {
        user_id: userInput.user_id,
      },
    });
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(PrismaDisconnectError.message, expect.any(String));
  });

  it('update user failed with sex invalid', async () => {
    expect.hasAssertions();
    const sexInvalidException = new BadRequestException(createMessage(messages.USER.YOUR_GENDER_INVALID));
    const logMethod = jest.spyOn(loggerService, 'error');
    const update = jest.spyOn(prismaService.user, 'update').mockRejectedValue(sexInvalidException);
    const updateService = jest.spyOn(userService, 'update');
    const updateController = jest.spyOn(userController, 'update');
    await expect(userController.update(userInput)).rejects.toThrow(new RpcException(sexInvalidException));
    expect(updateController).toHaveBeenCalledTimes(1);
    expect(updateService).toHaveBeenCalledTimes(1);
    expect(updateService).toHaveBeenCalledWith(userInput);
    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith({
      data: userInput,
      where: {
        user_id: userInput.user_id,
      },
    });
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(messages.USER.YOUR_GENDER_INVALID, expect.any(String));
  });

  it('update user failed with power invalid', async () => {
    expect.hasAssertions();
    const powerInvalidException = new BadRequestException(createMessage(messages.USER.YOUR_POWER_INVALID));
    const logMethod = jest.spyOn(loggerService, 'error');
    const update = jest.spyOn(prismaService.user, 'update').mockRejectedValue(powerInvalidException);
    const updateService = jest.spyOn(userService, 'update');
    const updateController = jest.spyOn(userController, 'update');
    await expect(userController.update(userInput)).rejects.toThrow(new RpcException(powerInvalidException));
    expect(updateController).toHaveBeenCalledTimes(1);
    expect(updateService).toHaveBeenCalledTimes(1);
    expect(updateService).toHaveBeenCalledWith(userInput);
    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith({
      data: userInput,
      where: {
        user_id: userInput.user_id,
      },
    });
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(messages.USER.YOUR_POWER_INVALID, expect.any(String));
  });

  it('update user failed with email was already exist', async () => {
    expect.hasAssertions();
    const emailExistException = new UnauthorizedException(createMessage(messages.USER.EMAIL_REGIS_ALREADY_EXIST));
    const logMethod = jest.spyOn(loggerService, 'error');
    const update = jest.spyOn(prismaService.user, 'update').mockRejectedValue(emailExistException);
    const updateService = jest.spyOn(userService, 'update');
    const updateController = jest.spyOn(userController, 'update');
    await expect(userController.update(userInput)).rejects.toThrow(new RpcException(emailExistException));
    expect(updateController).toHaveBeenCalledTimes(1);
    expect(updateService).toHaveBeenCalledTimes(1);
    expect(updateService).toHaveBeenCalledWith(userInput);
    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith({
      data: userInput,
      where: {
        user_id: userInput.user_id,
      },
    });
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(messages.USER.EMAIL_REGIS_ALREADY_EXIST, expect.any(String));
  });

  it('update user failed with phone was already exist', async () => {
    expect.hasAssertions();
    const phoneExistException = new UnauthorizedException(createMessage(messages.USER.PHONE_ALREADY_EXIST));
    const logMethod = jest.spyOn(loggerService, 'error');
    const update = jest.spyOn(prismaService.user, 'update').mockRejectedValue(phoneExistException);
    const updateService = jest.spyOn(userService, 'update');
    const updateController = jest.spyOn(userController, 'update');
    await expect(userController.update(userInput)).rejects.toThrow(new RpcException(phoneExistException));
    expect(updateController).toHaveBeenCalledTimes(1);
    expect(updateService).toHaveBeenCalledTimes(1);
    expect(updateService).toHaveBeenCalledWith(userInput);
    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith({
      data: userInput,
      where: {
        user_id: userInput.user_id,
      },
    });
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(messages.USER.PHONE_ALREADY_EXIST, expect.any(String));
  });
});

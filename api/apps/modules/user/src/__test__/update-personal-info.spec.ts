import { RpcException } from '@nestjs/microservices';
import { BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
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
};

beforeAll(async () => {
  const moduleRef = await startUp();
  userService = moduleRef.get(UserService);
  userController = moduleRef.get(UserController);
  loggerService = moduleRef.get(LoggingService);
  prismaService = moduleRef.get(PRISMA_CLIENT);
});

describe('update personal info', () => {
  it('update personal info success', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const update = jest.spyOn(prismaService.user, 'update').mockResolvedValue(user);
    const logout = jest.spyOn(userService, 'logout').mockResolvedValue(null);
    const updatePersonalInfoService = jest.spyOn(userService, 'updatePersonalInfo');
    const updatePersonalInfoController = jest.spyOn(userController, 'updatePersonalInfo');
    await expect(userController.updatePersonalInfo(userInput)).resolves.toBe(user);
    expect(updatePersonalInfoController).toHaveBeenCalledTimes(1);
    expect(updatePersonalInfoService).toHaveBeenCalledTimes(1);
    expect(updatePersonalInfoService).toHaveBeenCalledWith(userInput);
    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith({
      data: userInput,
      where: {
        user_id: userInput.user_id,
      },
    });
    expect(logout).toHaveBeenCalledTimes(1);
    expect(logout).toHaveBeenCalledWith(userInput.user_id);
    expect(logMethod).not.toHaveBeenCalled();
  });

  it('update personal info failed with unknown error', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const update = jest.spyOn(prismaService.user, 'update').mockRejectedValue(UnknownError);
    const logout = jest.spyOn(userService, 'logout');
    const updatePersonalInfoService = jest.spyOn(userService, 'updatePersonalInfo');
    const updatePersonalInfoController = jest.spyOn(userController, 'updatePersonalInfo');
    await expect(userController.updatePersonalInfo(userInput)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(messages.COMMON.COMMON_ERROR))),
    );
    expect(updatePersonalInfoController).toHaveBeenCalledTimes(1);
    expect(updatePersonalInfoService).toHaveBeenCalledTimes(1);
    expect(updatePersonalInfoService).toHaveBeenCalledWith(userInput);
    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith({
      data: userInput,
      where: {
        user_id: userInput.user_id,
      },
    });
    expect(logout).not.toHaveBeenCalled();
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(UnknownError.message, expect.any(String));
  });

  it('update personal info failed with database disconnect error', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const update = jest.spyOn(prismaService.user, 'update').mockRejectedValue(PrismaDisconnectError);
    const logout = jest.spyOn(userService, 'logout');
    const updatePersonalInfoService = jest.spyOn(userService, 'updatePersonalInfo');
    const updatePersonalInfoController = jest.spyOn(userController, 'updatePersonalInfo');
    await expect(userController.updatePersonalInfo(userInput)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(PrismaDisconnectError.message))),
    );
    expect(updatePersonalInfoController).toHaveBeenCalledTimes(1);
    expect(updatePersonalInfoService).toHaveBeenCalledTimes(1);
    expect(updatePersonalInfoService).toHaveBeenCalledWith(userInput);
    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith({
      data: userInput,
      where: {
        user_id: userInput.user_id,
      },
    });
    expect(logout).not.toHaveBeenCalled();
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(PrismaDisconnectError.message, expect.any(String));
  });

  it('update personal info failed with logout got database disconnect error', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const update = jest.spyOn(prismaService.user, 'update').mockResolvedValue(user);
    const logout = jest.spyOn(userService, 'logout').mockImplementation(() => {
      throw new RpcException(new BadRequestException(PrismaDisconnectError.message));
    });
    const updatePersonalInfoService = jest.spyOn(userService, 'updatePersonalInfo');
    const updatePersonalInfoController = jest.spyOn(userController, 'updatePersonalInfo');
    await expect(userController.updatePersonalInfo(userInput)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(PrismaDisconnectError.message))),
    );
    expect(updatePersonalInfoController).toHaveBeenCalledTimes(1);
    expect(updatePersonalInfoService).toHaveBeenCalledTimes(1);
    expect(updatePersonalInfoService).toHaveBeenCalledWith(userInput);
    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith({
      data: userInput,
      where: {
        user_id: userInput.user_id,
      },
    });
    expect(logout).toHaveBeenCalledTimes(1);
    expect(logout).toHaveBeenCalledWith(user.user_id);
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(PrismaDisconnectError.message, expect.any(String));
  });

  it('update personal info failed with logout got unknown error', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const update = jest.spyOn(prismaService.user, 'update').mockResolvedValue(user);
    const logout = jest.spyOn(userService, 'logout').mockRejectedValue(UnknownError);
    const updatePersonalInfoService = jest.spyOn(userService, 'updatePersonalInfo');
    const updatePersonalInfoController = jest.spyOn(userController, 'updatePersonalInfo');
    await expect(userController.updatePersonalInfo(userInput)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(messages.COMMON.COMMON_ERROR))),
    );
    expect(updatePersonalInfoController).toHaveBeenCalledTimes(1);
    expect(updatePersonalInfoService).toHaveBeenCalledTimes(1);
    expect(updatePersonalInfoService).toHaveBeenCalledWith(userInput);
    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith({
      data: userInput,
      where: {
        user_id: userInput.user_id,
      },
    });
    expect(logout).toHaveBeenCalledTimes(1);
    expect(logout).toHaveBeenCalledWith(user.user_id);
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(UnknownError.message, expect.any(String));
  });

  it('update personal info failed with logout got data not found error', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const update = jest.spyOn(prismaService.user, 'update').mockResolvedValue(user);
    const logout = jest.spyOn(userService, 'logout').mockImplementation(() => {
      throw new RpcException(new NotFoundException(messages.USER.NOT_FOUND));
    });
    const updatePersonalInfoService = jest.spyOn(userService, 'updatePersonalInfo');
    const updatePersonalInfoController = jest.spyOn(userController, 'updatePersonalInfo');
    await expect(userController.updatePersonalInfo(userInput)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(messages.USER.NOT_FOUND))),
    );
    expect(updatePersonalInfoController).toHaveBeenCalledTimes(1);
    expect(updatePersonalInfoService).toHaveBeenCalledTimes(1);
    expect(updatePersonalInfoService).toHaveBeenCalledWith(userInput);
    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith({
      data: userInput,
      where: {
        user_id: userInput.user_id,
      },
    });
    expect(logout).toHaveBeenCalledTimes(1);
    expect(logout).toHaveBeenCalledWith(user.user_id);
    expect(logMethod).not.toHaveBeenCalled();
  });

  it('update personal info failed with sex invalid', async () => {
    expect.hasAssertions();
    const logout = jest.spyOn(userService, 'logout');
    const sexInvalidException = new BadRequestException(createMessage(messages.USER.YOUR_GENDER_INVALID));
    const logMethod = jest.spyOn(loggerService, 'error');
    const update = jest.spyOn(prismaService.user, 'update').mockRejectedValue(sexInvalidException);
    const updatePersonalInfoService = jest.spyOn(userService, 'updatePersonalInfo');
    const updatePersonalInfoController = jest.spyOn(userController, 'updatePersonalInfo');
    await expect(userController.updatePersonalInfo(userInput)).rejects.toThrow(new RpcException(sexInvalidException));
    expect(updatePersonalInfoController).toHaveBeenCalledTimes(1);
    expect(updatePersonalInfoService).toHaveBeenCalledTimes(1);
    expect(updatePersonalInfoService).toHaveBeenCalledWith(userInput);
    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith({
      data: userInput,
      where: {
        user_id: userInput.user_id,
      },
    });
    expect(logout).not.toHaveBeenCalled();
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(messages.USER.YOUR_GENDER_INVALID, expect.any(String));
  });

  it('update personal info failed with power invalid', async () => {
    expect.hasAssertions();
    const logout = jest.spyOn(userService, 'logout');
    const powerInvalidException = new BadRequestException(createMessage(messages.USER.YOUR_POWER_INVALID));
    const logMethod = jest.spyOn(loggerService, 'error');
    const update = jest.spyOn(prismaService.user, 'update').mockRejectedValue(powerInvalidException);
    const updatePersonalInfoService = jest.spyOn(userService, 'updatePersonalInfo');
    const updatePersonalInfoController = jest.spyOn(userController, 'updatePersonalInfo');
    await expect(userController.updatePersonalInfo(userInput)).rejects.toThrow(new RpcException(powerInvalidException));
    expect(updatePersonalInfoController).toHaveBeenCalledTimes(1);
    expect(updatePersonalInfoService).toHaveBeenCalledTimes(1);
    expect(updatePersonalInfoService).toHaveBeenCalledWith(userInput);
    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith({
      data: userInput,
      where: {
        user_id: userInput.user_id,
      },
    });
    expect(logout).not.toHaveBeenCalled();
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(messages.USER.YOUR_POWER_INVALID, expect.any(String));
  });

  it('update personal info failed with email was already exist', async () => {
    expect.hasAssertions();
    const logout = jest.spyOn(userService, 'logout');
    const emailExistException = new UnauthorizedException(createMessage(messages.USER.EMAIL_REGIS_ALREADY_EXIST));
    const logMethod = jest.spyOn(loggerService, 'error');
    const update = jest.spyOn(prismaService.user, 'update').mockRejectedValue(emailExistException);
    const updatePersonalInfoService = jest.spyOn(userService, 'updatePersonalInfo');
    const updatePersonalInfoController = jest.spyOn(userController, 'updatePersonalInfo');
    await expect(userController.updatePersonalInfo(userInput)).rejects.toThrow(new RpcException(emailExistException));
    expect(updatePersonalInfoController).toHaveBeenCalledTimes(1);
    expect(updatePersonalInfoService).toHaveBeenCalledTimes(1);
    expect(updatePersonalInfoService).toHaveBeenCalledWith(userInput);
    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith({
      data: userInput,
      where: {
        user_id: userInput.user_id,
      },
    });
    expect(logout).not.toHaveBeenCalled();
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(messages.USER.EMAIL_REGIS_ALREADY_EXIST, expect.any(String));
  });

  it('update personal info failed with phone was already exist', async () => {
    expect.hasAssertions();
    const logout = jest.spyOn(userService, 'logout');
    const phoneExistException = new UnauthorizedException(createMessage(messages.USER.PHONE_ALREADY_EXIST));
    const logMethod = jest.spyOn(loggerService, 'error');
    const update = jest.spyOn(prismaService.user, 'update').mockRejectedValue(phoneExistException);
    const updatePersonalInfoService = jest.spyOn(userService, 'updatePersonalInfo');
    const updatePersonalInfoController = jest.spyOn(userController, 'updatePersonalInfo');
    await expect(userController.updatePersonalInfo(userInput)).rejects.toThrow(new RpcException(phoneExistException));
    expect(updatePersonalInfoController).toHaveBeenCalledTimes(1);
    expect(updatePersonalInfoService).toHaveBeenCalledTimes(1);
    expect(updatePersonalInfoService).toHaveBeenCalledWith(userInput);
    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith({
      data: userInput,
      where: {
        user_id: userInput.user_id,
      },
    });
    expect(logout).not.toHaveBeenCalled();
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(messages.USER.PHONE_ALREADY_EXIST, expect.any(String));
  });
});

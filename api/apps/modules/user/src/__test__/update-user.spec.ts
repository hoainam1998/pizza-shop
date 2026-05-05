import { ClientProxy, RpcException } from '@nestjs/microservices';
import { BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
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
import { PrismaDisconnectError, PrismaNotFoundError } from '@share/test/pre-setup/mock/errors/prisma-errors';
import { updateUserCompletePattern } from '@share/pattern';

let prismaService: PrismaClient;
let loggerService: LoggingService;
let userController: UserController;
let userService: UserService;
let socketService: ClientProxy;

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
  socketService = moduleRef.get(SOCKET_SERVICE);
});

describe('update user', () => {
  it('update user success', async () => {
    expect.hasAssertions();
    const findUniqueOrThrow = jest.spyOn(prismaService.user, 'findUniqueOrThrow').mockResolvedValue(user);
    const update = jest.spyOn(prismaService.user, 'update').mockResolvedValue(user);
    const logout = jest.spyOn(userService, 'logout').mockResolvedValue(null);
    const emit = jest.spyOn(socketService, 'emit').mockImplementation(jest.fn());
    const updateService = jest.spyOn(userService, 'update');
    const updateController = jest.spyOn(userController, 'update');
    await expect(userController.update(userInput)).resolves.toBe(user);
    expect(updateController).toHaveBeenCalledTimes(1);
    expect(updateService).toHaveBeenCalledTimes(1);
    expect(updateService).toHaveBeenCalledWith(userInput);
    expect(findUniqueOrThrow).toHaveBeenCalledTimes(1);
    expect(findUniqueOrThrow).toHaveBeenCalledWith({
      where: {
        user_id: userInput.user_id,
      },
      select: {
        session_id: true,
      },
    });
    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith({
      data: userInput,
      where: {
        user_id: userInput.user_id,
      },
    });
    expect(emit).toHaveBeenCalledTimes(1);
    expect(emit).toHaveBeenCalledWith(updateUserCompletePattern, user.user_id);
    expect(logout).toHaveBeenCalledTimes(1);
    expect(logout).toHaveBeenCalledWith(userInput.user_id);
  });

  it('update user failed with findUniqueOrThrow got unknown error', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const findUniqueOrThrow = jest.spyOn(prismaService.user, 'findUniqueOrThrow').mockRejectedValue(UnknownError);
    const update = jest.spyOn(prismaService.user, 'update').mockResolvedValue(user);
    const logout = jest.spyOn(userService, 'logout');
    const emit = jest.spyOn(socketService, 'emit').mockImplementation(jest.fn());
    const updateService = jest.spyOn(userService, 'update');
    const updateController = jest.spyOn(userController, 'update');
    await expect(userController.update(userInput)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(messages.COMMON.COMMON_ERROR))),
    );
    expect(updateController).toHaveBeenCalledTimes(1);
    expect(updateService).toHaveBeenCalledTimes(1);
    expect(updateService).toHaveBeenCalledWith(userInput);
    expect(findUniqueOrThrow).toHaveBeenCalledTimes(1);
    expect(findUniqueOrThrow).toHaveBeenCalledWith({
      where: {
        user_id: user.user_id,
      },
      select: {
        session_id: true,
      },
    });
    expect(update).not.toHaveBeenCalled();
    expect(emit).not.toHaveBeenCalled();
    expect(logout).not.toHaveBeenCalled();
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(UnknownError.message, expect.any(String));
  });

  it('update user failed with update got unknown error', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const findUniqueOrThrow = jest.spyOn(prismaService.user, 'findUniqueOrThrow').mockResolvedValue(user);
    const update = jest.spyOn(prismaService.user, 'update').mockRejectedValue(UnknownError);
    const logout = jest.spyOn(userService, 'logout');
    const emit = jest.spyOn(socketService, 'emit').mockImplementation(jest.fn());
    const updateService = jest.spyOn(userService, 'update');
    const updateController = jest.spyOn(userController, 'update');
    await expect(userController.update(userInput)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(messages.COMMON.COMMON_ERROR))),
    );
    expect(updateController).toHaveBeenCalledTimes(1);
    expect(updateService).toHaveBeenCalledTimes(1);
    expect(updateService).toHaveBeenCalledWith(userInput);
    expect(findUniqueOrThrow).toHaveBeenCalledTimes(1);
    expect(findUniqueOrThrow).toHaveBeenCalledWith({
      where: {
        user_id: user.user_id,
      },
      select: {
        session_id: true,
      },
    });
    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith({
      data: userInput,
      where: {
        user_id: userInput.user_id,
      },
    });
    expect(emit).not.toHaveBeenCalled();
    expect(logout).not.toHaveBeenCalled();
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(UnknownError.message, expect.any(String));
  });

  it('update user failed with findUniqueOrThrow got not found error', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const findUniqueOrThrow = jest
      .spyOn(prismaService.user, 'findUniqueOrThrow')
      .mockRejectedValue(PrismaNotFoundError);
    const update = jest.spyOn(prismaService.user, 'update').mockResolvedValue(user);
    const logout = jest.spyOn(userService, 'logout');
    const emit = jest.spyOn(socketService, 'emit').mockImplementation(jest.fn());
    const updateService = jest.spyOn(userService, 'update');
    const updateController = jest.spyOn(userController, 'update');
    await expect(userController.update(userInput)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(messages.USER.NOT_FOUND))),
    );
    expect(updateController).toHaveBeenCalledTimes(1);
    expect(updateService).toHaveBeenCalledTimes(1);
    expect(updateService).toHaveBeenCalledWith(userInput);
    expect(findUniqueOrThrow).toHaveBeenCalledTimes(1);
    expect(findUniqueOrThrow).toHaveBeenCalledWith({
      where: {
        user_id: user.user_id,
      },
      select: {
        session_id: true,
      },
    });
    expect(update).not.toHaveBeenCalled();
    expect(logout).not.toHaveBeenCalled();
    expect(emit).not.toHaveBeenCalled();
    expect(logMethod).not.toHaveBeenCalled();
  });

  it('update user failed with update got not found error', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const findUniqueOrThrow = jest.spyOn(prismaService.user, 'findUniqueOrThrow').mockResolvedValue(user);
    const update = jest.spyOn(prismaService.user, 'update').mockRejectedValue(PrismaNotFoundError);
    const logout = jest.spyOn(userService, 'logout');
    const emit = jest.spyOn(socketService, 'emit').mockImplementation(jest.fn());
    const updateService = jest.spyOn(userService, 'update');
    const updateController = jest.spyOn(userController, 'update');
    await expect(userController.update(userInput)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(messages.USER.NOT_FOUND))),
    );
    expect(updateController).toHaveBeenCalledTimes(1);
    expect(updateService).toHaveBeenCalledTimes(1);
    expect(updateService).toHaveBeenCalledWith(userInput);
    expect(findUniqueOrThrow).toHaveBeenCalledTimes(1);
    expect(findUniqueOrThrow).toHaveBeenCalledWith({
      where: {
        user_id: user.user_id,
      },
      select: {
        session_id: true,
      },
    });
    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith({
      data: userInput,
      where: {
        user_id: userInput.user_id,
      },
    });
    expect(logout).not.toHaveBeenCalled();
    expect(emit).not.toHaveBeenCalled();
    expect(logMethod).not.toHaveBeenCalled();
  });

  it('update user failed with findUniqueOrThrow got database disconnect error', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const findUniqueOrThrow = jest
      .spyOn(prismaService.user, 'findUniqueOrThrow')
      .mockRejectedValue(PrismaDisconnectError);
    const update = jest.spyOn(prismaService.user, 'update').mockResolvedValue(user);
    const logout = jest.spyOn(userService, 'logout');
    const emit = jest.spyOn(socketService, 'emit').mockImplementation(jest.fn());
    const updateService = jest.spyOn(userService, 'update');
    const updateController = jest.spyOn(userController, 'update');
    await expect(userController.update(userInput)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(PrismaDisconnectError.message))),
    );
    expect(updateController).toHaveBeenCalledTimes(1);
    expect(updateService).toHaveBeenCalledTimes(1);
    expect(updateService).toHaveBeenCalledWith(userInput);
    expect(findUniqueOrThrow).toHaveBeenCalledTimes(1);
    expect(findUniqueOrThrow).toHaveBeenCalledWith({
      where: {
        user_id: user.user_id,
      },
      select: {
        session_id: true,
      },
    });
    expect(update).not.toHaveBeenCalled();
    expect(logout).not.toHaveBeenCalled();
    expect(emit).not.toHaveBeenCalled();
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(PrismaDisconnectError.message, expect.any(String));
  });

  it('update user failed with update got database disconnect error', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const findUniqueOrThrow = jest.spyOn(prismaService.user, 'findUniqueOrThrow').mockResolvedValue(user);
    const update = jest.spyOn(prismaService.user, 'update').mockRejectedValue(PrismaDisconnectError);
    const logout = jest.spyOn(userService, 'logout');
    const emit = jest.spyOn(socketService, 'emit').mockImplementation(jest.fn());
    const updateService = jest.spyOn(userService, 'update');
    const updateController = jest.spyOn(userController, 'update');
    await expect(userController.update(userInput)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(PrismaDisconnectError.message))),
    );
    expect(updateController).toHaveBeenCalledTimes(1);
    expect(updateService).toHaveBeenCalledTimes(1);
    expect(updateService).toHaveBeenCalledWith(userInput);
    expect(findUniqueOrThrow).toHaveBeenCalledTimes(1);
    expect(findUniqueOrThrow).toHaveBeenCalledWith({
      where: {
        user_id: user.user_id,
      },
      select: {
        session_id: true,
      },
    });
    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith({
      data: userInput,
      where: {
        user_id: userInput.user_id,
      },
    });
    expect(logout).not.toHaveBeenCalled();
    expect(emit).not.toHaveBeenCalled();
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(PrismaDisconnectError.message, expect.any(String));
  });

  it('update user failed with logout got database disconnect error', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const findUniqueOrThrow = jest.spyOn(prismaService.user, 'findUniqueOrThrow').mockResolvedValue(user);
    const update = jest.spyOn(prismaService.user, 'update').mockResolvedValue(user);
    const emit = jest.spyOn(socketService, 'emit').mockImplementation(jest.fn());
    const logout = jest.spyOn(userService, 'logout').mockImplementation(() => {
      throw new RpcException(new BadRequestException(PrismaDisconnectError.message));
    });
    const updateService = jest.spyOn(userService, 'update');
    const updateController = jest.spyOn(userController, 'update');
    await expect(userController.update(userInput)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(PrismaDisconnectError.message))),
    );
    expect(updateController).toHaveBeenCalledTimes(1);
    expect(updateService).toHaveBeenCalledTimes(1);
    expect(updateService).toHaveBeenCalledWith(userInput);
    expect(findUniqueOrThrow).toHaveBeenCalledTimes(1);
    expect(findUniqueOrThrow).toHaveBeenCalledWith({
      where: {
        user_id: user.user_id,
      },
      select: {
        session_id: true,
      },
    });
    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith({
      data: userInput,
      where: {
        user_id: userInput.user_id,
      },
    });
    expect(logout).toHaveBeenCalledTimes(1);
    expect(logout).toHaveBeenCalledWith(user.user_id);
    expect(emit).not.toHaveBeenCalled();
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(PrismaDisconnectError.message, expect.any(String));
  });

  it('update user failed with logout got unknown error', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const findUniqueOrThrow = jest.spyOn(prismaService.user, 'findUniqueOrThrow').mockResolvedValue(user);
    const update = jest.spyOn(prismaService.user, 'update').mockResolvedValue(user);
    const logout = jest.spyOn(userService, 'logout').mockRejectedValue(UnknownError);
    const emit = jest.spyOn(socketService, 'emit').mockImplementation(jest.fn());
    const updateService = jest.spyOn(userService, 'update');
    const updateController = jest.spyOn(userController, 'update');
    await expect(userController.update(userInput)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(messages.COMMON.COMMON_ERROR))),
    );
    expect(updateController).toHaveBeenCalledTimes(1);
    expect(updateService).toHaveBeenCalledTimes(1);
    expect(updateService).toHaveBeenCalledWith(userInput);
    expect(findUniqueOrThrow).toHaveBeenCalledTimes(1);
    expect(findUniqueOrThrow).toHaveBeenCalledWith({
      where: {
        user_id: user.user_id,
      },
      select: {
        session_id: true,
      },
    });
    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith({
      data: userInput,
      where: {
        user_id: userInput.user_id,
      },
    });
    expect(logout).toHaveBeenCalledTimes(1);
    expect(logout).toHaveBeenCalledWith(user.user_id);
    expect(emit).not.toHaveBeenCalled();
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(UnknownError.message, expect.any(String));
  });

  it('update user failed with logout got not found error', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const findUniqueOrThrow = jest.spyOn(prismaService.user, 'findUniqueOrThrow').mockResolvedValue(user);
    const update = jest.spyOn(prismaService.user, 'update').mockResolvedValue(user);
    const emit = jest.spyOn(socketService, 'emit').mockImplementation(jest.fn());
    const logout = jest.spyOn(userService, 'logout').mockImplementation(() => {
      throw new RpcException(new NotFoundException(messages.USER.NOT_FOUND));
    });
    const updateService = jest.spyOn(userService, 'update');
    const updateController = jest.spyOn(userController, 'update');
    await expect(userController.update(userInput)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(messages.USER.NOT_FOUND))),
    );
    expect(updateController).toHaveBeenCalledTimes(1);
    expect(updateService).toHaveBeenCalledTimes(1);
    expect(updateService).toHaveBeenCalledWith(userInput);
    expect(findUniqueOrThrow).toHaveBeenCalledTimes(1);
    expect(findUniqueOrThrow).toHaveBeenCalledWith({
      where: {
        user_id: user.user_id,
      },
      select: {
        session_id: true,
      },
    });
    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith({
      data: userInput,
      where: {
        user_id: userInput.user_id,
      },
    });
    expect(logout).toHaveBeenCalledTimes(1);
    expect(emit).not.toHaveBeenCalled();
    expect(logout).toHaveBeenCalledWith(user.user_id);
    expect(logMethod).not.toHaveBeenCalled();
  });

  it('update user failed with sex invalid', async () => {
    expect.hasAssertions();
    const logout = jest.spyOn(userService, 'logout');
    const emit = jest.spyOn(socketService, 'emit').mockImplementation(jest.fn());
    const sexInvalidException = new BadRequestException(createMessage(messages.USER.YOUR_GENDER_INVALID));
    const logMethod = jest.spyOn(loggerService, 'error');
    const findUniqueOrThrow = jest.spyOn(prismaService.user, 'findUniqueOrThrow').mockResolvedValue(user);
    const update = jest.spyOn(prismaService.user, 'update').mockRejectedValue(sexInvalidException);
    const updateService = jest.spyOn(userService, 'update');
    const updateController = jest.spyOn(userController, 'update');
    await expect(userController.update(userInput)).rejects.toThrow(new RpcException(sexInvalidException));
    expect(updateController).toHaveBeenCalledTimes(1);
    expect(updateService).toHaveBeenCalledTimes(1);
    expect(updateService).toHaveBeenCalledWith(userInput);
    expect(findUniqueOrThrow).toHaveBeenCalledTimes(1);
    expect(findUniqueOrThrow).toHaveBeenCalledWith({
      where: {
        user_id: user.user_id,
      },
      select: {
        session_id: true,
      },
    });
    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith({
      data: userInput,
      where: {
        user_id: userInput.user_id,
      },
    });
    expect(logout).not.toHaveBeenCalled();
    expect(emit).not.toHaveBeenCalled();
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(messages.USER.YOUR_GENDER_INVALID, expect.any(String));
  });

  it('update user failed with email was already exist', async () => {
    expect.hasAssertions();
    const emit = jest.spyOn(socketService, 'emit').mockImplementation(jest.fn());
    const logout = jest.spyOn(userService, 'logout');
    const emailExistException = new UnauthorizedException(createMessage(messages.USER.EMAIL_REGIS_ALREADY_EXIST));
    const logMethod = jest.spyOn(loggerService, 'error');
    const findUniqueOrThrow = jest.spyOn(prismaService.user, 'findUniqueOrThrow').mockResolvedValue(user);
    const update = jest.spyOn(prismaService.user, 'update').mockRejectedValue(emailExistException);
    const updateService = jest.spyOn(userService, 'update');
    const updateController = jest.spyOn(userController, 'update');
    await expect(userController.update(userInput)).rejects.toThrow(new RpcException(emailExistException));
    expect(updateController).toHaveBeenCalledTimes(1);
    expect(updateService).toHaveBeenCalledTimes(1);
    expect(updateService).toHaveBeenCalledWith(userInput);
    expect(findUniqueOrThrow).toHaveBeenCalledTimes(1);
    expect(findUniqueOrThrow).toHaveBeenCalledWith({
      where: {
        user_id: user.user_id,
      },
      select: {
        session_id: true,
      },
    });
    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith({
      data: userInput,
      where: {
        user_id: userInput.user_id,
      },
    });
    expect(logout).not.toHaveBeenCalled();
    expect(emit).not.toHaveBeenCalled();
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(messages.USER.EMAIL_REGIS_ALREADY_EXIST, expect.any(String));
  });

  it('update user failed with phone was already exist', async () => {
    expect.hasAssertions();
    const emit = jest.spyOn(socketService, 'emit').mockImplementation(jest.fn());
    const logout = jest.spyOn(userService, 'logout');
    const phoneExistException = new UnauthorizedException(createMessage(messages.USER.PHONE_ALREADY_EXIST));
    const logMethod = jest.spyOn(loggerService, 'error');
    const findUniqueOrThrow = jest.spyOn(prismaService.user, 'findUniqueOrThrow').mockResolvedValue(user);
    const update = jest.spyOn(prismaService.user, 'update').mockRejectedValue(phoneExistException);
    const updateService = jest.spyOn(userService, 'update');
    const updateController = jest.spyOn(userController, 'update');
    await expect(userController.update(userInput)).rejects.toThrow(new RpcException(phoneExistException));
    expect(updateController).toHaveBeenCalledTimes(1);
    expect(updateService).toHaveBeenCalledTimes(1);
    expect(updateService).toHaveBeenCalledWith(userInput);
    expect(findUniqueOrThrow).toHaveBeenCalledTimes(1);
    expect(findUniqueOrThrow).toHaveBeenCalledWith({
      where: {
        user_id: user.user_id,
      },
      select: {
        session_id: true,
      },
    });
    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith({
      data: userInput,
      where: {
        user_id: userInput.user_id,
      },
    });
    expect(logout).not.toHaveBeenCalled();
    expect(emit).not.toHaveBeenCalled();
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(messages.USER.PHONE_ALREADY_EXIST, expect.any(String));
  });
});

import { RpcException } from '@nestjs/microservices';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import LoggingService from '@share/libs/logging/logging.service';
import startUp from './pre-setup';
import UserController from '../user.controller';
import UserService from '../user.service';
import { user } from '@share/test/pre-setup/mock/data/user';
import { createProductList } from '@share/test/pre-setup/mock/data/product';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import { createMessage } from '@share/utils';
import messages from '@share/constants/messages';
import { PrismaDisconnectError } from '@share/test/pre-setup/mock/errors/prisma-errors';
import ProductCachingService from '@share/libs/caching/product/product.service';
import ReportCachingService from '@share/libs/caching/report/report.service';

let loggerService: LoggingService;
let userController: UserController;
let userService: UserService;
let productCachingService: ProductCachingService;
let reportCachingService: ReportCachingService;
const userId = user.user_id;
const productIds = createProductList(2).map((product) => product.product_id);
const removeVisitorParameters = productIds.map((productId) => [productId, userId]);

beforeAll(async () => {
  const moduleRef = await startUp();
  userService = moduleRef.get(UserService);
  userController = moduleRef.get(UserController);
  loggerService = moduleRef.get(LoggingService);
  productCachingService = moduleRef.get(ProductCachingService);
  reportCachingService = moduleRef.get(ReportCachingService);
});

describe('logout', () => {
  it('logout success', async () => {
    expect.hasAssertions();
    const getProductsAccessByVisitor = jest
      .spyOn(productCachingService, 'getProductsAccessByVisitor')
      .mockResolvedValue(productIds);
    const removeVisitor = jest.spyOn(productCachingService, 'removeVisitor').mockResolvedValue(1);
    const removeReportViewer = jest.spyOn(reportCachingService, 'removeReportViewer').mockResolvedValue(1);
    const updateUserSessionId = jest.spyOn(userService, 'updateUserSessionId').mockResolvedValue(user);
    const logoutService = jest.spyOn(userService, 'logout');
    const logoutController = jest.spyOn(userController, 'logout');
    await expect(userController.logout(userId)).resolves.toEqual(null);
    expect(logoutController).toHaveBeenCalledTimes(1);
    expect(logoutService).toHaveBeenCalledTimes(1);
    expect(logoutService).toHaveBeenCalledWith(userId);
    expect(getProductsAccessByVisitor).toHaveBeenCalledTimes(1);
    expect(getProductsAccessByVisitor).toHaveBeenCalledWith(userId);
    expect(removeVisitor).toHaveBeenCalledTimes(productIds.length);
    expect(removeVisitor.mock.calls).toEqual(removeVisitorParameters);
    expect(removeReportViewer).toHaveBeenCalledTimes(1);
    expect(removeReportViewer).toHaveBeenCalledWith(userId);
    expect(updateUserSessionId).toHaveBeenCalledTimes(1);
    expect(updateUserSessionId).toHaveBeenCalledWith(userId, null);
  });

  it('logout failed with getProductsAccessByVisitor got unknown error', async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(loggerService, 'error').mockImplementation(jest.fn);
    const getProductsAccessByVisitor = jest
      .spyOn(productCachingService, 'getProductsAccessByVisitor')
      .mockRejectedValue(UnknownError);
    const removeVisitor = jest.spyOn(productCachingService, 'removeVisitor').mockResolvedValue(1);
    const removeReportViewer = jest.spyOn(reportCachingService, 'removeReportViewer').mockResolvedValue(1);
    const updateUserSessionId = jest.spyOn(userService, 'updateUserSessionId').mockResolvedValue(user);
    const logoutService = jest.spyOn(userService, 'logout');
    const logoutController = jest.spyOn(userController, 'logout');
    await expect(userController.logout(userId)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(messages.COMMON.COMMON_ERROR))),
    );
    expect(logoutController).toHaveBeenCalledTimes(1);
    expect(logoutService).toHaveBeenCalledTimes(1);
    expect(logoutService).toHaveBeenCalledWith(userId);
    expect(getProductsAccessByVisitor).toHaveBeenCalledTimes(1);
    expect(getProductsAccessByVisitor).toHaveBeenCalledWith(userId);
    expect(removeVisitor).not.toHaveBeenCalled();
    expect(removeReportViewer).not.toHaveBeenCalled();
    expect(updateUserSessionId).not.toHaveBeenCalled();
    expect(logError).toHaveBeenCalledTimes(1);
    expect(logError).toHaveBeenCalledWith(UnknownError.message, expect.any(String));
  });

  it('logout failed with removeVisitor got unknown error', async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(loggerService, 'error').mockImplementation(jest.fn);
    const getProductsAccessByVisitor = jest
      .spyOn(productCachingService, 'getProductsAccessByVisitor')
      .mockResolvedValue(productIds);
    const removeVisitor = jest.spyOn(productCachingService, 'removeVisitor').mockRejectedValue(UnknownError);
    const removeReportViewer = jest.spyOn(reportCachingService, 'removeReportViewer').mockResolvedValue(1);
    const updateUserSessionId = jest.spyOn(userService, 'updateUserSessionId').mockResolvedValue(user);
    const logoutService = jest.spyOn(userService, 'logout');
    const logoutController = jest.spyOn(userController, 'logout');
    await expect(userController.logout(userId)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(messages.COMMON.COMMON_ERROR))),
    );
    expect(logoutController).toHaveBeenCalledTimes(1);
    expect(logoutService).toHaveBeenCalledTimes(1);
    expect(logoutService).toHaveBeenCalledWith(userId);
    expect(getProductsAccessByVisitor).toHaveBeenCalledTimes(1);
    expect(getProductsAccessByVisitor).toHaveBeenCalledWith(userId);
    expect(removeVisitor).toHaveBeenCalledTimes(productIds.length);
    expect(removeVisitor.mock.calls).toEqual(removeVisitorParameters);
    expect(removeReportViewer).not.toHaveBeenCalled();
    expect(updateUserSessionId).not.toHaveBeenCalled();
    expect(logError).toHaveBeenCalledTimes(1);
    expect(logError).toHaveBeenCalledWith(UnknownError.message, expect.any(String));
  });

  it('logout failed with removeReportViewer got unknown error', async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(loggerService, 'error').mockImplementation(jest.fn);
    const getProductsAccessByVisitor = jest
      .spyOn(productCachingService, 'getProductsAccessByVisitor')
      .mockResolvedValue(productIds);
    const removeVisitor = jest.spyOn(productCachingService, 'removeVisitor').mockResolvedValue(1);
    const removeReportViewer = jest.spyOn(reportCachingService, 'removeReportViewer').mockRejectedValue(UnknownError);
    const updateUserSessionId = jest.spyOn(userService, 'updateUserSessionId').mockResolvedValue(user);
    const logoutService = jest.spyOn(userService, 'logout');
    const logoutController = jest.spyOn(userController, 'logout');
    await expect(userController.logout(userId)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(messages.COMMON.COMMON_ERROR))),
    );
    expect(logoutController).toHaveBeenCalledTimes(1);
    expect(logoutService).toHaveBeenCalledTimes(1);
    expect(logoutService).toHaveBeenCalledWith(userId);
    expect(getProductsAccessByVisitor).toHaveBeenCalledTimes(1);
    expect(getProductsAccessByVisitor).toHaveBeenCalledWith(userId);
    expect(removeVisitor).toHaveBeenCalledTimes(productIds.length);
    expect(removeVisitor.mock.calls).toEqual(removeVisitorParameters);
    expect(removeReportViewer).toHaveBeenCalledTimes(1);
    expect(removeReportViewer).toHaveBeenCalledWith(userId);
    expect(updateUserSessionId).not.toHaveBeenCalled();
    expect(logError).toHaveBeenCalledTimes(1);
    expect(logError).toHaveBeenCalledWith(UnknownError.message, expect.any(String));
  });

  it('logout failed with updateUserSessionId got unknown error', async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(loggerService, 'error').mockImplementation(jest.fn);
    const getProductsAccessByVisitor = jest
      .spyOn(productCachingService, 'getProductsAccessByVisitor')
      .mockResolvedValue(productIds);
    const removeVisitor = jest.spyOn(productCachingService, 'removeVisitor').mockResolvedValue(1);
    const removeReportViewer = jest.spyOn(reportCachingService, 'removeReportViewer').mockResolvedValue(1);
    const updateUserSessionId = jest.spyOn(userService, 'updateUserSessionId').mockRejectedValue(UnknownError);
    const logoutService = jest.spyOn(userService, 'logout');
    const logoutController = jest.spyOn(userController, 'logout');
    await expect(userController.logout(userId)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(messages.COMMON.COMMON_ERROR))),
    );
    expect(logoutController).toHaveBeenCalledTimes(1);
    expect(logoutService).toHaveBeenCalledTimes(1);
    expect(logoutService).toHaveBeenCalledWith(userId);
    expect(getProductsAccessByVisitor).toHaveBeenCalledTimes(1);
    expect(getProductsAccessByVisitor).toHaveBeenCalledWith(userId);
    expect(removeVisitor).toHaveBeenCalledTimes(productIds.length);
    expect(removeVisitor.mock.calls).toEqual(removeVisitorParameters);
    expect(removeReportViewer).toHaveBeenCalledTimes(1);
    expect(removeReportViewer).toHaveBeenCalledWith(userId);
    expect(updateUserSessionId).toHaveBeenCalledTimes(1);
    expect(updateUserSessionId).toHaveBeenCalledWith(userId, null);
    expect(logError).toHaveBeenCalledTimes(1);
    expect(logError).toHaveBeenCalledWith(UnknownError.message, expect.any(String));
  });

  it('logout failed with updateUserSessionId got data not found error', async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(loggerService, 'error').mockImplementation(jest.fn);
    const getProductsAccessByVisitor = jest
      .spyOn(productCachingService, 'getProductsAccessByVisitor')
      .mockResolvedValue(productIds);
    const removeVisitor = jest.spyOn(productCachingService, 'removeVisitor').mockResolvedValue(1);
    const removeReportViewer = jest.spyOn(reportCachingService, 'removeReportViewer').mockResolvedValue(1);
    const updateUserSessionId = jest.spyOn(userService, 'updateUserSessionId').mockImplementation(() => {
      throw new RpcException(new NotFoundException(messages.USER.NOT_FOUND));
    });
    const logoutService = jest.spyOn(userService, 'logout');
    const logoutController = jest.spyOn(userController, 'logout');
    await expect(userController.logout(userId)).rejects.toThrow(
      new RpcException(new NotFoundException(messages.USER.NOT_FOUND)),
    );
    expect(logoutController).toHaveBeenCalledTimes(1);
    expect(logoutService).toHaveBeenCalledTimes(1);
    expect(logoutService).toHaveBeenCalledWith(userId);
    expect(getProductsAccessByVisitor).toHaveBeenCalledTimes(1);
    expect(getProductsAccessByVisitor).toHaveBeenCalledWith(userId);
    expect(removeVisitor).toHaveBeenCalledTimes(productIds.length);
    expect(removeVisitor.mock.calls).toEqual(removeVisitorParameters);
    expect(removeReportViewer).toHaveBeenCalledTimes(1);
    expect(removeReportViewer).toHaveBeenCalledWith(userId);
    expect(updateUserSessionId).toHaveBeenCalledTimes(1);
    expect(updateUserSessionId).toHaveBeenCalledWith(userId, null);
    expect(logError).not.toHaveBeenCalled();
  });

  it('logout failed with updateUserSessionId got database disconnect error', async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(loggerService, 'error').mockImplementation(jest.fn);
    const getProductsAccessByVisitor = jest
      .spyOn(productCachingService, 'getProductsAccessByVisitor')
      .mockResolvedValue(productIds);
    const removeVisitor = jest.spyOn(productCachingService, 'removeVisitor').mockResolvedValue(1);
    const removeReportViewer = jest.spyOn(reportCachingService, 'removeReportViewer').mockResolvedValue(1);
    const updateUserSessionId = jest.spyOn(userService, 'updateUserSessionId').mockImplementation(() => {
      throw new RpcException(new BadRequestException(PrismaDisconnectError.message));
    });
    const logoutService = jest.spyOn(userService, 'logout');
    const logoutController = jest.spyOn(userController, 'logout');
    await expect(userController.logout(userId)).rejects.toThrow(
      new RpcException(new BadRequestException(PrismaDisconnectError.message)),
    );
    expect(logoutController).toHaveBeenCalledTimes(1);
    expect(logoutService).toHaveBeenCalledTimes(1);
    expect(logoutService).toHaveBeenCalledWith(userId);
    expect(getProductsAccessByVisitor).toHaveBeenCalledTimes(1);
    expect(getProductsAccessByVisitor).toHaveBeenCalledWith(userId);
    expect(removeVisitor).toHaveBeenCalledTimes(productIds.length);
    expect(removeVisitor.mock.calls).toEqual(removeVisitorParameters);
    expect(removeReportViewer).toHaveBeenCalledTimes(1);
    expect(removeReportViewer).toHaveBeenCalledWith(userId);
    expect(updateUserSessionId).toHaveBeenCalledTimes(1);
    expect(updateUserSessionId).toHaveBeenCalledWith(userId, null);
    expect(logError).toHaveBeenCalledTimes(1);
    expect(logError).toHaveBeenCalledWith(PrismaDisconnectError.message, expect.any(String));
  });
});

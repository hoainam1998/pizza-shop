import { RpcException } from '@nestjs/microservices';
import { BadRequestException } from '@nestjs/common';
import { set } from 'date-fns';
import startUp from './pre-setup';
import ProductController from '../product.controller';
import ProductService from '../product.service';
import * as helper from '../chart-helper.helper';
import { createBills } from '@share/test/pre-setup/mock/data/bill';
import { PrismaDisconnectError } from '@share/test/pre-setup/mock/errors/prisma-errors';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import messages from '@share/constants/messages';

let productController: ProductController;
let productService: ProductService;
const bills = createBills(2);

jest.mock('date-fns', () => ({
  ...jest.requireActual('date-fns'),
  set: jest.fn().mockReturnValue(new Date()),
}));

beforeAll(async () => {
  const moduleRef = await startUp();
  productService = moduleRef.get(ProductService);
  productController = moduleRef.get(ProductController);
});

beforeEach(() => {
  jest.useFakeTimers();
  jest.spyOn(helper, 'action');
});

afterEach(() => {
  jest.useRealTimers();
});

describe('load data purchase volume chart', () => {
  it('load data purchase volume chart success', async () => {
    expect.hasAssertions();
    const mockingDefaultDate = new Date();
    mockingDefaultDate.setHours(8, 0, 0, 0);
    jest.setSystemTime(mockingDefaultDate);
    const limitTimestamp = new Date();
    const minimumTimestamp = new Date();
    limitTimestamp.setHours(23, 0, 0, 0);
    minimumTimestamp.setHours(7, 0, 0, 0);
    (set as any).mockReturnValueOnce(limitTimestamp).mockReturnValueOnce(minimumTimestamp);
    const getBillsAtSpecificTime = jest.spyOn(productService as any, 'getBillsAtSpecificTime').mockResolvedValue(bills);
    const executeActionAtTimeline = jest
      .spyOn(productService as any, 'executeActionAtTimeline')
      .mockImplementation(jest.fn);
    const loadDataChartService = jest.spyOn(productService, 'loadDataPurchaseVolumeChart');
    const loadDataChartController = jest.spyOn(productController, 'loadDataPurchaseVolumeChart');
    await expect(productController.loadDataPurchaseVolumeChart()).resolves.toEqual({
      revenue: expect.any(Array),
      capital: expect.any(Array),
      targetTime: expect.any(Number),
    });
    expect(loadDataChartController).toHaveBeenCalledTimes(1);
    expect(loadDataChartService).toHaveBeenCalledTimes(1);
    expect(getBillsAtSpecificTime).toHaveBeenCalledTimes(1);
    expect(getBillsAtSpecificTime).toHaveBeenCalledWith(expect.any(Number), expect.any(Number));
    expect(executeActionAtTimeline).toHaveBeenCalledTimes(1);
    expect(executeActionAtTimeline).toHaveBeenCalledWith(expect.any(Number));
    expect(helper.action).toHaveBeenCalledTimes(1);
    expect(helper.action).toHaveBeenCalledWith(bills);
  });

  it('load data purchase volume chart success when current time less than 7', async () => {
    expect.hasAssertions();
    const mockingDefaultDate = new Date();
    mockingDefaultDate.setHours(4, 0, 0, 0);
    jest.setSystemTime(mockingDefaultDate);
    const limitTimestamp = new Date();
    const minimumTimestamp = new Date();
    limitTimestamp.setHours(23, 0, 0, 0);
    minimumTimestamp.setHours(7, 0, 0, 0);
    (set as any).mockReturnValueOnce(limitTimestamp).mockReturnValueOnce(minimumTimestamp);
    const getBillsAtSpecificTime = jest.spyOn(productService as any, 'getBillsAtSpecificTime').mockResolvedValue(bills);
    const executeActionAtTimeline = jest
      .spyOn(productService as any, 'executeActionAtTimeline')
      .mockImplementation(jest.fn);
    const loadDataChartService = jest.spyOn(productService, 'loadDataPurchaseVolumeChart');
    const loadDataChartController = jest.spyOn(productController, 'loadDataPurchaseVolumeChart');
    await expect(productController.loadDataPurchaseVolumeChart()).resolves.toEqual({
      revenue: expect.any(Array),
      capital: expect.any(Array),
      targetTime: expect.any(Number),
    });
    expect(loadDataChartController).toHaveBeenCalledTimes(1);
    expect(loadDataChartService).toHaveBeenCalledTimes(1);
    expect(getBillsAtSpecificTime).toHaveBeenCalledTimes(1);
    expect(getBillsAtSpecificTime).toHaveBeenCalledWith(expect.any(Number), expect.any(Number));
    expect(executeActionAtTimeline).not.toHaveBeenCalled();
    expect(helper.action).toHaveBeenCalledTimes(1);
    expect(helper.action).toHaveBeenCalledWith(bills);
  });

  it('load data purchase volume chart success when current time over than 23', async () => {
    expect.hasAssertions();
    const mockingDefaultDate = new Date();
    mockingDefaultDate.setHours(24, 0, 0, 0);
    jest.setSystemTime(mockingDefaultDate);
    const limitTimestamp = new Date();
    const minimumTimestamp = new Date();
    limitTimestamp.setHours(23, 0, 0, 0);
    minimumTimestamp.setHours(7, 0, 0, 0);
    (set as any).mockReturnValueOnce(limitTimestamp).mockReturnValueOnce(minimumTimestamp);
    const getBillsAtSpecificTime = jest.spyOn(productService as any, 'getBillsAtSpecificTime').mockResolvedValue(bills);
    const executeActionAtTimeline = jest
      .spyOn(productService as any, 'executeActionAtTimeline')
      .mockImplementation(jest.fn);
    const loadDataChartService = jest.spyOn(productService, 'loadDataPurchaseVolumeChart');
    const loadDataChartController = jest.spyOn(productController, 'loadDataPurchaseVolumeChart');
    await expect(productController.loadDataPurchaseVolumeChart()).resolves.toEqual({
      revenue: expect.any(Array),
      capital: expect.any(Array),
      targetTime: expect.any(Number),
    });
    expect(loadDataChartController).toHaveBeenCalledTimes(1);
    expect(loadDataChartService).toHaveBeenCalledTimes(1);
    expect(getBillsAtSpecificTime).toHaveBeenCalledTimes(1);
    expect(getBillsAtSpecificTime).toHaveBeenCalledWith(expect.any(Number), expect.any(Number));
    expect(executeActionAtTimeline).not.toHaveBeenCalled();
    expect(helper.action).toHaveBeenCalledTimes(1);
    expect(helper.action).toHaveBeenCalledWith(bills);
  });

  it('load data purchase volume chart failed with prisma database disconnect', async () => {
    expect.hasAssertions();
    const mockingDefaultDate = new Date();
    mockingDefaultDate.setHours(8, 0, 0, 0);
    jest.setSystemTime(mockingDefaultDate);
    const limitTimestamp = new Date();
    const minimumTimestamp = new Date();
    limitTimestamp.setHours(23, 0, 0, 0);
    minimumTimestamp.setHours(7, 0, 0, 0);
    (set as any).mockReturnValueOnce(limitTimestamp).mockReturnValueOnce(minimumTimestamp);
    const getBillsAtSpecificTime = jest
      .spyOn(productService as any, 'getBillsAtSpecificTime')
      .mockRejectedValue(PrismaDisconnectError);
    const executeActionAtTimeline = jest
      .spyOn(productService as any, 'executeActionAtTimeline')
      .mockImplementation(jest.fn);
    const loadDataChartService = jest.spyOn(productService, 'loadDataPurchaseVolumeChart');
    const loadDataChartController = jest.spyOn(productController, 'loadDataPurchaseVolumeChart');
    await expect(productController.loadDataPurchaseVolumeChart()).rejects.toThrow(
      new RpcException(new BadRequestException(PrismaDisconnectError.message)),
    );
    expect(loadDataChartController).toHaveBeenCalledTimes(1);
    expect(loadDataChartService).toHaveBeenCalledTimes(1);
    expect(getBillsAtSpecificTime).toHaveBeenCalledTimes(1);
    expect(getBillsAtSpecificTime).toHaveBeenCalledWith(expect.any(Number), expect.any(Number));
    expect(executeActionAtTimeline).not.toHaveBeenCalled();
    expect(helper.action).not.toHaveBeenCalled();
  });

  it('load data purchase volume chart failed when getBillsAtSpecificTime method got unknown error', async () => {
    expect.hasAssertions();
    const mockingDefaultDate = new Date();
    mockingDefaultDate.setHours(8, 0, 0, 0);
    jest.setSystemTime(mockingDefaultDate);
    const limitTimestamp = new Date();
    const minimumTimestamp = new Date();
    limitTimestamp.setHours(23, 0, 0, 0);
    minimumTimestamp.setHours(7, 0, 0, 0);
    (set as any).mockReturnValueOnce(limitTimestamp).mockReturnValueOnce(minimumTimestamp);
    const getBillsAtSpecificTime = jest
      .spyOn(productService as any, 'getBillsAtSpecificTime')
      .mockRejectedValue(UnknownError);
    const executeActionAtTimeline = jest
      .spyOn(productService as any, 'executeActionAtTimeline')
      .mockImplementation(jest.fn);
    const loadDataChartService = jest.spyOn(productService, 'loadDataPurchaseVolumeChart');
    const loadDataChartController = jest.spyOn(productController, 'loadDataPurchaseVolumeChart');
    await expect(productController.loadDataPurchaseVolumeChart()).rejects.toThrow(
      new RpcException(new BadRequestException(messages.COMMON.COMMON_ERROR)),
    );
    expect(loadDataChartController).toHaveBeenCalledTimes(1);
    expect(loadDataChartService).toHaveBeenCalledTimes(1);
    expect(getBillsAtSpecificTime).toHaveBeenCalledTimes(1);
    expect(getBillsAtSpecificTime).toHaveBeenCalledWith(expect.any(Number), expect.any(Number));
    expect(executeActionAtTimeline).not.toHaveBeenCalled();
    expect(helper.action).not.toHaveBeenCalled();
  });

  it('load data purchase volume chart failed when executeActionAtTimeline method got unknown error', async () => {
    expect.hasAssertions();
    const mockingDefaultDate = new Date();
    mockingDefaultDate.setHours(8, 0, 0, 0);
    jest.setSystemTime(mockingDefaultDate);
    const limitTimestamp = new Date();
    const minimumTimestamp = new Date();
    const executeTime = new Date();
    executeTime.setHours(executeTime.getHours() + 1, 0, 0, 0);
    limitTimestamp.setHours(23, 0, 0, 0);
    minimumTimestamp.setHours(7, 0, 0, 0);
    (set as any)
      .mockReturnValueOnce(limitTimestamp)
      .mockReturnValueOnce(minimumTimestamp)
      .mockReturnValueOnce(executeTime);
    const getBillsAtSpecificTime = jest.spyOn(productService as any, 'getBillsAtSpecificTime').mockResolvedValue(bills);
    const executeActionAtTimeline = jest
      .spyOn(productService as any, 'executeActionAtTimeline')
      .mockImplementation(() => {
        throw UnknownError;
      });
    const loadDataChartService = jest.spyOn(productService, 'loadDataPurchaseVolumeChart');
    const loadDataChartController = jest.spyOn(productController, 'loadDataPurchaseVolumeChart');
    await expect(productController.loadDataPurchaseVolumeChart()).rejects.toThrow(
      new RpcException(new BadRequestException(messages.COMMON.COMMON_ERROR)),
    );
    expect(loadDataChartController).toHaveBeenCalledTimes(1);
    expect(loadDataChartService).toHaveBeenCalledTimes(1);
    expect(getBillsAtSpecificTime).toHaveBeenCalledTimes(1);
    expect(getBillsAtSpecificTime).toHaveBeenCalledWith(expect.any(Number), expect.any(Number));
    expect(executeActionAtTimeline).toHaveBeenCalledTimes(1);
    expect(executeActionAtTimeline).toHaveBeenCalledWith(expect.any(Number));
    expect(helper.action).toHaveBeenCalledTimes(1);
    expect(helper.action).toHaveBeenCalledWith(bills);
  });
});

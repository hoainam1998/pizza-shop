import { BadRequestException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaClient } from 'generated/prisma';
import startUp from './pre-setup';
import ProductController from '../product.controller';
import ProductService from '../product.service';
import * as helper from '../chart-helper.helper';
import { PRISMA_CLIENT } from '@share/di-token';
import { createBills } from '@share/test/pre-setup/mock/data/bill';
import { CHART_BY } from '@share/enums';
import { DataChartType } from '@share/interfaces';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import { PrismaDisconnectError } from '@share/test/pre-setup/mock/errors/prisma-errors';
import messages from '@share/constants/messages';

let productController: ProductController;
let productService: ProductService;
let prismaService: PrismaClient;
const bills = createBills(2);

const payload = {
  by: CHART_BY.DAY,
  time: Date.now(),
};

beforeEach((done) => {
  jest.spyOn(helper, 'action');
  done();
});

const haveValue = (dataChart: DataChartType): void => {
  expect(dataChart.revenue.length).toBeGreaterThan(0);
  expect(dataChart.capital.length).toBeGreaterThan(0);
  expect(dataChart.labels!.length).toBeGreaterThan(0);
};

const valueIsEmpty = (dataChart: DataChartType): void => {
  expect(dataChart.revenue).toEqual([]);
  expect(dataChart.capital).toEqual([]);
  expect(dataChart.labels).toEqual([]);
};

beforeAll(async () => {
  const moduleRef = await startUp();
  productService = moduleRef.get(ProductService);
  productController = moduleRef.get(ProductController);
  prismaService = moduleRef.get(PRISMA_CLIENT);
});

describe('load data revenue chart', () => {
  it('load data revenue chart success', async () => {
    expect.hasAssertions();
    const findMany = jest.spyOn(prismaService.bill, 'findMany').mockResolvedValue(bills);
    const loadDataRevenueChartService = jest.spyOn(productService, 'loadDataRevenueChart');
    const loadDataRevenueChartController = jest.spyOn(productController, 'loadDataRevenueChart');
    await expect(productController.loadDataRevenueChart(payload)).resolves.toEqual({
      revenue: expect.any(Array),
      capital: expect.any(Array),
      labels: expect.any(Array),
    });
    haveValue(await loadDataRevenueChartController.mock.results[0].value);
    expect(loadDataRevenueChartController).toHaveBeenCalledTimes(1);
    expect(loadDataRevenueChartService).toHaveBeenCalledTimes(1);
    expect(loadDataRevenueChartService).toHaveBeenCalledWith(payload);
    expect(findMany).toHaveBeenCalledTimes(1);
    expect(findMany).toHaveBeenCalledWith({
      where: {
        created_at: {
          gte: expect.any(String),
          lt: expect.any(String),
        },
      },
      select: {
        capital: true,
        complete_total: true,
        created_at: true,
      },
    });
    expect(helper.action).toHaveBeenCalledTimes(1);
    expect(helper.action).toHaveBeenCalledWith(bills, payload.by);
  });

  it('load data revenue chart failed with unknown error', async () => {
    expect.hasAssertions();
    const findMany = jest.spyOn(prismaService.bill, 'findMany').mockRejectedValue(UnknownError);
    const loadDataRevenueChartService = jest.spyOn(productService, 'loadDataRevenueChart');
    const loadDataRevenueChartController = jest.spyOn(productController, 'loadDataRevenueChart');
    await expect(productController.loadDataRevenueChart(payload)).rejects.toThrow(
      new RpcException(new BadRequestException(messages.COMMON.COMMON_ERROR)),
    );
    expect(loadDataRevenueChartController).toHaveBeenCalledTimes(1);
    expect(loadDataRevenueChartService).toHaveBeenCalledTimes(1);
    expect(loadDataRevenueChartService).toHaveBeenCalledWith(payload);
    expect(findMany).toHaveBeenCalledTimes(1);
    expect(findMany).toHaveBeenCalledWith({
      where: {
        created_at: {
          gte: expect.any(String),
          lt: expect.any(String),
        },
      },
      select: {
        capital: true,
        complete_total: true,
        created_at: true,
      },
    });
    expect(helper.action).not.toHaveBeenCalled();
  });

  it('load data revenue chart failed with database disconnect error', async () => {
    expect.hasAssertions();
    const findMany = jest.spyOn(prismaService.bill, 'findMany').mockRejectedValue(PrismaDisconnectError);
    const loadDataRevenueChartService = jest.spyOn(productService, 'loadDataRevenueChart');
    const loadDataRevenueChartController = jest.spyOn(productController, 'loadDataRevenueChart');
    await expect(productController.loadDataRevenueChart(payload)).rejects.toThrow(
      new RpcException(new BadRequestException(PrismaDisconnectError.message)),
    );
    expect(loadDataRevenueChartController).toHaveBeenCalledTimes(1);
    expect(loadDataRevenueChartService).toHaveBeenCalledTimes(1);
    expect(loadDataRevenueChartService).toHaveBeenCalledWith(payload);
    expect(findMany).toHaveBeenCalledTimes(1);
    expect(findMany).toHaveBeenCalledWith({
      where: {
        created_at: {
          gte: expect.any(String),
          lt: expect.any(String),
        },
      },
      select: {
        capital: true,
        complete_total: true,
        created_at: true,
      },
    });
    expect(helper.action).not.toHaveBeenCalled();
  });

  it('load data revenue chart failed with select keyword invalid', async () => {
    expect.hasAssertions();
    const payloadWithKeywordInvalid = {
      ...payload,
      by: '',
    };
    const findMany = jest.spyOn(prismaService.bill, 'findMany').mockRejectedValue(PrismaDisconnectError);
    const loadDataRevenueChartService = jest.spyOn(productService, 'loadDataRevenueChart');
    const loadDataRevenueChartController = jest.spyOn(productController, 'loadDataRevenueChart');
    await expect(productController.loadDataRevenueChart(payloadWithKeywordInvalid)).resolves.toEqual({
      revenue: expect.any(Array),
      capital: expect.any(Array),
      labels: expect.any(Array),
    });
    valueIsEmpty(await loadDataRevenueChartController.mock.results[0].value);
    expect(loadDataRevenueChartController).toHaveBeenCalledTimes(1);
    expect(loadDataRevenueChartService).toHaveBeenCalledTimes(1);
    expect(loadDataRevenueChartService).toHaveBeenCalledWith(payloadWithKeywordInvalid);
    expect(findMany).not.toHaveBeenCalled();
    expect(helper.action).not.toHaveBeenCalled();
  });
});

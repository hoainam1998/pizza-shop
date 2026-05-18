import { BadRequestException, HttpStatus, InternalServerErrorException, RequestMethod } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import TestAgent from 'supertest/lib/agent';
import { ClientProxy } from '@nestjs/microservices';
import { ValidationError } from 'class-validator';
import startUp from './pre-setup';
import ProductModule from '../product.module';
import ProductService from '../product.service';
import ProductController from '../product.controller';
import messages from '@share/constants/messages';
import { sessionPayload } from '@share/test/pre-setup/mock/data/user';
import { HTTP_METHOD, POWER_NUMERIC, CHART_BY } from '@share/enums';
import { createDescribeTest, createTestName, getMockModule } from '@share/test/helpers';
import { ProductRouter } from '@share/router';
import { loadDataRevenueChartPattern } from '@share/pattern';
import { createMessages } from '@share/utils';
import { RevenueDataChart } from '@share/dto/serializer/product';
import { PrismaDisconnectError } from '@share/test/pre-setup/mock/errors/prisma-errors';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
const loadDataRevenueChartUrl = ProductRouter.absolute.loadDataRevenueChart;

const MockProductModule = getMockModule(ProductModule, {
  path: loadDataRevenueChartUrl,
  method: RequestMethod.POST,
});

const chartResponse = {
  revenue: [0],
  capital: [0],
  labels: ['7'],
};

const payload = {
  by: CHART_BY.DAY,
  time: Date.now(),
};

let api: TestAgent;
let clientProxy: ClientProxy;
let close: () => Promise<void>;
let productService: ProductService;
let productController: ProductController;

beforeAll(async () => {
  const requestTest = await startUp(MockProductModule);
  api = requestTest.api;
  clientProxy = requestTest.clientProxy;
  close = () => requestTest.app.close();
  productService = requestTest.app.get(ProductService);
  productController = requestTest.app.get(ProductController);
});

afterEach(async () => {
  if (close) {
    await close();
  }
});

describe(createDescribeTest(HTTP_METHOD.POST, loadDataRevenueChartUrl), () => {
  it(createTestName('load data revenue chart success', HttpStatus.OK), async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(productController as any, 'logError');
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(chartResponse));
    const loadDataRevenueChart = jest.spyOn(productService, 'loadDataRevenueChart');
    await api
      .post(loadDataRevenueChartUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(payload)
      .expect(HttpStatus.OK)
      .expect('Content-Type', /application\/json/)
      .expect(chartResponse);
    expect(loadDataRevenueChart).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(loadDataRevenueChartPattern, payload);
    expect(logError).not.toHaveBeenCalled();
  });

  it(createTestName('load data revenue chart failed with authentication error', HttpStatus.UNAUTHORIZED), async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(productController as any, 'logError');
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(chartResponse));
    const loadDataRevenueChart = jest.spyOn(productService, 'loadDataRevenueChart');
    await api
      .post(loadDataRevenueChartUrl)
      .send(payload)
      .expect(HttpStatus.UNAUTHORIZED)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.DID_NOT_LOGIN));
    expect(loadDataRevenueChart).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
    expect(logError).not.toHaveBeenCalled();
  });

  it(
    createTestName('load data revenue chart failed with user do not have permission', HttpStatus.UNAUTHORIZED),
    async () => {
      expect.hasAssertions();
      const logError = jest.spyOn(productController as any, 'logError');
      const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(chartResponse));
      const loadDataRevenueChart = jest.spyOn(productService, 'loadDataRevenueChart');
      await api
        .post(loadDataRevenueChartUrl)
        .set('mock-session', JSON.stringify({ ...sessionPayload, power: POWER_NUMERIC.SALE }))
        .send(payload)
        .expect(HttpStatus.UNAUTHORIZED)
        .expect('Content-Type', /application\/json/)
        .expect(createMessages(messages.USER.DO_NOT_PERMISSION));
      expect(loadDataRevenueChart).not.toHaveBeenCalled();
      expect(send).not.toHaveBeenCalled();
      expect(logError).not.toHaveBeenCalled();
    },
  );

  it(createTestName('load data revenue chart failed when request missing field', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const payloadWithoutByField = {
      time: Date.now(),
    };
    const logError = jest.spyOn(productController as any, 'logError');
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(chartResponse));
    const loadDataRevenueChart = jest.spyOn(productService, 'loadDataRevenueChart');
    const response = await api
      .post(loadDataRevenueChartUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(payloadWithoutByField)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/);
    expect(response.body).toEqual({
      messages: expect.any(Array),
    });
    expect(loadDataRevenueChart).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
    expect(logError).not.toHaveBeenCalled();
  });

  it(createTestName('load data revenue chart failed when invalid select field', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const payloadWithInvalidBy = {
      time: Date.now(),
      by: '',
    };
    const logError = jest.spyOn(productController as any, 'logError');
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(chartResponse));
    const loadDataRevenueChart = jest.spyOn(productService, 'loadDataRevenueChart');
    const response = await api
      .post(loadDataRevenueChartUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(payloadWithInvalidBy)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/);
    expect(response.body).toEqual({
      messages: expect.any(Array),
    });
    expect(loadDataRevenueChart).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
    expect(logError).not.toHaveBeenCalled();
  });

  it(createTestName('load data revenue chart failed with output validate', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(productController as any, 'logError');
    const validateErrors = [new ValidationError()];
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(chartResponse));
    jest.spyOn(RevenueDataChart.prototype, 'validate').mockResolvedValue(validateErrors);
    const loadDataRevenueChart = jest.spyOn(productService, 'loadDataRevenueChart');
    await api
      .post(loadDataRevenueChartUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(payload)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.COMMON.OUTPUT_VALIDATE));
    expect(loadDataRevenueChart).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(loadDataRevenueChartPattern, payload);
    expect(logError).toHaveBeenCalledTimes(1);
    expect(logError).toHaveBeenCalledWith(validateErrors, expect.any(String));
  });

  it(
    createTestName('load data revenue chart failed with database disconnect error', HttpStatus.BAD_REQUEST),
    async () => {
      expect.hasAssertions();
      const logError = jest.spyOn(productController as any, 'logError');
      const send = jest
        .spyOn(clientProxy, 'send')
        .mockReturnValue(throwError(() => new BadRequestException(PrismaDisconnectError.message)));
      const loadDataRevenueChart = jest.spyOn(productService, 'loadDataRevenueChart');
      await api
        .post(loadDataRevenueChartUrl)
        .set('mock-session', JSON.stringify(sessionPayload))
        .send(payload)
        .expect(HttpStatus.BAD_REQUEST)
        .expect('Content-Type', /application\/json/)
        .expect(createMessages(messages.COMMON.DATABASE_DISCONNECT));
      expect(loadDataRevenueChart).toHaveBeenCalledTimes(1);
      expect(send).toHaveBeenCalledTimes(1);
      expect(send).toHaveBeenCalledWith(loadDataRevenueChartPattern, payload);
      expect(logError).not.toHaveBeenCalled();
    },
  );

  it(createTestName('load data revenue chart failed with server error', HttpStatus.INTERNAL_SERVER_ERROR), async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(productController as any, 'logError');
    const serverError = new InternalServerErrorException();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => serverError));
    const loadDataRevenueChart = jest.spyOn(productService, 'loadDataRevenueChart');
    await api
      .post(loadDataRevenueChartUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(payload)
      .expect(HttpStatus.INTERNAL_SERVER_ERROR)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(serverError.message));
    expect(loadDataRevenueChart).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(loadDataRevenueChartPattern, payload);
    expect(logError).not.toHaveBeenCalled();
  });

  it(
    createTestName('load data revenue chart failed with unknown error', HttpStatus.INTERNAL_SERVER_ERROR),
    async () => {
      expect.hasAssertions();
      const logError = jest.spyOn(productController as any, 'logError');
      const serverError = new InternalServerErrorException();
      const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => UnknownError));
      const loadDataRevenueChart = jest.spyOn(productService, 'loadDataRevenueChart');
      await api
        .post(loadDataRevenueChartUrl)
        .set('mock-session', JSON.stringify(sessionPayload))
        .send(payload)
        .expect(HttpStatus.INTERNAL_SERVER_ERROR)
        .expect('Content-Type', /application\/json/)
        .expect(createMessages(serverError.message));
      expect(loadDataRevenueChart).toHaveBeenCalledTimes(1);
      expect(send).toHaveBeenCalledTimes(1);
      expect(send).toHaveBeenCalledWith(loadDataRevenueChartPattern, payload);
      expect(logError).not.toHaveBeenCalled();
    },
  );

  it(createTestName('load data revenue chart failed with rpc unknown error', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(productController as any, 'logError');
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new BadRequestException(messages.COMMON.COMMON_ERROR)));
    const loadDataRevenueChart = jest.spyOn(productService, 'loadDataRevenueChart');
    await api
      .post(loadDataRevenueChartUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(payload)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.COMMON.COMMON_ERROR));
    expect(loadDataRevenueChart).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(loadDataRevenueChartPattern, payload);
    expect(logError).not.toHaveBeenCalled();
  });
});

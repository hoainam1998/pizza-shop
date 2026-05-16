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
import { HTTP_METHOD } from '@share/enums';
import { createDescribeTest, createTestName, getMockModule } from '@share/test/helpers';
import { ProductRouter } from '@share/router';
import { loadDataPurchaseVolumeChartPattern } from '@share/pattern';
import { createMessages } from '@share/utils';
import { PurchaseVolumeDataChart } from '@share/dto/serializer/product';
import { PrismaDisconnectError } from '@share/test/pre-setup/mock/errors/prisma-errors';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
const loadDataPurchaseVolumeChartUrl = ProductRouter.absolute.loadDataPurchaseVolumeChart;

const MockProductModule = getMockModule(ProductModule, {
  path: loadDataPurchaseVolumeChartUrl,
  method: RequestMethod.POST,
});

const chartResponse = {
  revenue: [0],
  capital: [0],
  labels: ['7'],
  targetTime: Date.now(),
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

describe(createDescribeTest(HTTP_METHOD.POST, loadDataPurchaseVolumeChartUrl), () => {
  it(createTestName('load data purchase volume chart success', HttpStatus.OK), async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(productController as any, 'logError');
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(chartResponse));
    const loadDataPurchaseVolumeChart = jest.spyOn(productService, 'loadDataPurchaseVolumeChart');
    await api
      .post(loadDataPurchaseVolumeChartUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .expect(HttpStatus.OK)
      .expect('Content-Type', /application\/json/)
      .expect(chartResponse);
    expect(loadDataPurchaseVolumeChart).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(loadDataPurchaseVolumeChartPattern, {});
    expect(logError).not.toHaveBeenCalled();
  });

  it(
    createTestName('load data purchase volume chart failed with authentication error', HttpStatus.UNAUTHORIZED),
    async () => {
      expect.hasAssertions();
      const logError = jest.spyOn(productController as any, 'logError');
      const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(chartResponse));
      const loadDataPurchaseVolumeChart = jest.spyOn(productService, 'loadDataPurchaseVolumeChart');
      await api
        .post(loadDataPurchaseVolumeChartUrl)
        .expect(HttpStatus.UNAUTHORIZED)
        .expect('Content-Type', /application\/json/)
        .expect(createMessages(messages.USER.DID_NOT_LOGIN));
      expect(loadDataPurchaseVolumeChart).not.toHaveBeenCalled();
      expect(send).not.toHaveBeenCalled();
      expect(logError).not.toHaveBeenCalled();
    },
  );

  it(
    createTestName('load data purchase volume chart failed with output validate', HttpStatus.BAD_REQUEST),
    async () => {
      expect.hasAssertions();
      const logError = jest.spyOn(productController as any, 'logError');
      const validateErrors = [new ValidationError()];
      const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(chartResponse));
      jest.spyOn(PurchaseVolumeDataChart.prototype, 'validate').mockResolvedValue(validateErrors);
      const loadDataPurchaseVolumeChart = jest.spyOn(productService, 'loadDataPurchaseVolumeChart');
      await api
        .post(loadDataPurchaseVolumeChartUrl)
        .set('mock-session', JSON.stringify(sessionPayload))
        .expect(HttpStatus.BAD_REQUEST)
        .expect('Content-Type', /application\/json/)
        .expect(createMessages(messages.COMMON.OUTPUT_VALIDATE));
      expect(loadDataPurchaseVolumeChart).toHaveBeenCalledTimes(1);
      expect(send).toHaveBeenCalledTimes(1);
      expect(send).toHaveBeenCalledWith(loadDataPurchaseVolumeChartPattern, {});
      expect(logError).toHaveBeenCalledTimes(1);
      expect(logError).toHaveBeenCalledWith(validateErrors, expect.any(String));
    },
  );

  it(
    createTestName('load data purchase volume chart failed with database disconnect error', HttpStatus.BAD_REQUEST),
    async () => {
      expect.hasAssertions();
      const logError = jest.spyOn(productController as any, 'logError');
      const send = jest
        .spyOn(clientProxy, 'send')
        .mockReturnValue(throwError(() => new BadRequestException(PrismaDisconnectError.message)));
      const loadDataPurchaseVolumeChart = jest.spyOn(productService, 'loadDataPurchaseVolumeChart');
      await api
        .post(loadDataPurchaseVolumeChartUrl)
        .set('mock-session', JSON.stringify(sessionPayload))
        .expect(HttpStatus.BAD_REQUEST)
        .expect('Content-Type', /application\/json/)
        .expect(createMessages(messages.COMMON.DATABASE_DISCONNECT));
      expect(loadDataPurchaseVolumeChart).toHaveBeenCalledTimes(1);
      expect(send).toHaveBeenCalledTimes(1);
      expect(send).toHaveBeenCalledWith(loadDataPurchaseVolumeChartPattern, {});
      expect(logError).not.toHaveBeenCalled();
    },
  );

  it(
    createTestName('load data purchase volume chart failed with server error', HttpStatus.INTERNAL_SERVER_ERROR),
    async () => {
      expect.hasAssertions();
      const logError = jest.spyOn(productController as any, 'logError');
      const serverError = new InternalServerErrorException();
      const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => serverError));
      const loadDataPurchaseVolumeChart = jest.spyOn(productService, 'loadDataPurchaseVolumeChart');
      await api
        .post(loadDataPurchaseVolumeChartUrl)
        .set('mock-session', JSON.stringify(sessionPayload))
        .expect(HttpStatus.INTERNAL_SERVER_ERROR)
        .expect('Content-Type', /application\/json/)
        .expect(createMessages(serverError.message));
      expect(loadDataPurchaseVolumeChart).toHaveBeenCalledTimes(1);
      expect(send).toHaveBeenCalledTimes(1);
      expect(send).toHaveBeenCalledWith(loadDataPurchaseVolumeChartPattern, {});
      expect(logError).not.toHaveBeenCalled();
    },
  );

  it(
    createTestName('load data purchase volume chart failed with unknown error', HttpStatus.INTERNAL_SERVER_ERROR),
    async () => {
      expect.hasAssertions();
      const logError = jest.spyOn(productController as any, 'logError');
      const serverError = new InternalServerErrorException();
      const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => UnknownError));
      const loadDataPurchaseVolumeChart = jest.spyOn(productService, 'loadDataPurchaseVolumeChart');
      await api
        .post(loadDataPurchaseVolumeChartUrl)
        .set('mock-session', JSON.stringify(sessionPayload))
        .expect(HttpStatus.INTERNAL_SERVER_ERROR)
        .expect('Content-Type', /application\/json/)
        .expect(createMessages(serverError.message));
      expect(loadDataPurchaseVolumeChart).toHaveBeenCalledTimes(1);
      expect(send).toHaveBeenCalledTimes(1);
      expect(send).toHaveBeenCalledWith(loadDataPurchaseVolumeChartPattern, {});
      expect(logError).not.toHaveBeenCalled();
    },
  );

  it(
    createTestName('load data purchase volume chart failed with rpc unknown error', HttpStatus.BAD_REQUEST),
    async () => {
      expect.hasAssertions();
      const logError = jest.spyOn(productController as any, 'logError');
      const send = jest
        .spyOn(clientProxy, 'send')
        .mockReturnValue(throwError(() => new BadRequestException(messages.COMMON.COMMON_ERROR)));
      const loadDataPurchaseVolumeChart = jest.spyOn(productService, 'loadDataPurchaseVolumeChart');
      await api
        .post(loadDataPurchaseVolumeChartUrl)
        .set('mock-session', JSON.stringify(sessionPayload))
        .expect(HttpStatus.BAD_REQUEST)
        .expect('Content-Type', /application\/json/)
        .expect(createMessages(messages.COMMON.COMMON_ERROR));
      expect(loadDataPurchaseVolumeChart).toHaveBeenCalledTimes(1);
      expect(send).toHaveBeenCalledTimes(1);
      expect(send).toHaveBeenCalledWith(loadDataPurchaseVolumeChartPattern, {});
      expect(logError).not.toHaveBeenCalled();
    },
  );
});

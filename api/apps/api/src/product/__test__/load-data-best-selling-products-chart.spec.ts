import { BadRequestException, HttpStatus, InternalServerErrorException, RequestMethod } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import TestAgent from 'supertest/lib/agent';
import { ClientProxy } from '@nestjs/microservices';
import { ValidationError } from 'class-validator';
import { instanceToPlain } from 'class-transformer';
import startUp from './pre-setup';
import ProductModule from '../product.module';
import ProductService from '../product.service';
import ProductController from '../product.controller';
import messages from '@share/constants/messages';
import { sessionPayload } from '@share/test/pre-setup/mock/data/user';
import { product } from '@share/test/pre-setup/mock/data/product';
import { HTTP_METHOD, POWER_NUMERIC, CHART_BY } from '@share/enums';
import { createDescribeTest, createTestName, getMockModule } from '@share/test/helpers';
import { ProductRouter } from '@share/router';
import { loadDataBestSellingProductsChartPattern } from '@share/pattern';
import { createMessages } from '@share/utils';
import { BestSellingProductDataChart } from '@share/dto/serializer/product';
import { PrismaDisconnectError } from '@share/test/pre-setup/mock/errors/prisma-errors';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
const loadDataBestSellingProductsChartUrl = ProductRouter.absolute.loadDataBestSellingProductsChart;

const MockProductModule = getMockModule(ProductModule, {
  path: loadDataBestSellingProductsChartUrl,
  method: RequestMethod.POST,
});

const chartResponse = [
  {
    id: product.product_id,
    name: product.name,
    count: product.count,
  },
  {
    id: product.product_id,
    name: product.name,
    count: product.count,
  },
];

const chartResponseConverter = instanceToPlain(
  new BestSellingProductDataChart([
    {
      id: product.product_id,
      name: product.name,
      count: product.count,
    },
    {
      id: product.product_id,
      name: product.name,
      count: product.count,
    },
  ]).list,
);

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

describe(createDescribeTest(HTTP_METHOD.POST, loadDataBestSellingProductsChartUrl), () => {
  it(createTestName('load data best selling products chart success', HttpStatus.OK), async () => {
    expect.hasAssertions();
    const logError = jest.spyOn(productController as any, 'logError');
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(chartResponse));
    const loadDataBestSellingProductsChart = jest.spyOn(productService, 'loadDataBestSellingProductsChart');
    await api
      .post(loadDataBestSellingProductsChartUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(payload)
      .expect(HttpStatus.OK)
      .expect('Content-Type', /application\/json/)
      .expect(chartResponseConverter);
    expect(loadDataBestSellingProductsChart).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(loadDataBestSellingProductsChartPattern, payload);
    expect(logError).not.toHaveBeenCalled();
  });

  it(
    createTestName('load data best selling products chart failed with authentication error', HttpStatus.UNAUTHORIZED),
    async () => {
      expect.hasAssertions();
      const logError = jest.spyOn(productController as any, 'logError');
      const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(chartResponse));
      const loadDataBestSellingProductsChart = jest.spyOn(productService, 'loadDataBestSellingProductsChart');
      await api
        .post(loadDataBestSellingProductsChartUrl)
        .send(payload)
        .expect(HttpStatus.UNAUTHORIZED)
        .expect('Content-Type', /application\/json/)
        .expect(createMessages(messages.USER.DID_NOT_LOGIN));
      expect(loadDataBestSellingProductsChart).not.toHaveBeenCalled();
      expect(send).not.toHaveBeenCalled();
      expect(logError).not.toHaveBeenCalled();
    },
  );

  it(
    createTestName(
      'load data best selling products chart failed with user do not have permission',
      HttpStatus.UNAUTHORIZED,
    ),
    async () => {
      expect.hasAssertions();
      const logError = jest.spyOn(productController as any, 'logError');
      const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(chartResponse));
      const loadDataBestSellingProductsChart = jest.spyOn(productService, 'loadDataBestSellingProductsChart');
      await api
        .post(loadDataBestSellingProductsChartUrl)
        .set('mock-session', JSON.stringify({ ...sessionPayload, power: POWER_NUMERIC.SALE }))
        .send(payload)
        .expect(HttpStatus.UNAUTHORIZED)
        .expect('Content-Type', /application\/json/)
        .expect(createMessages(messages.USER.DO_NOT_PERMISSION));
      expect(loadDataBestSellingProductsChart).not.toHaveBeenCalled();
      expect(send).not.toHaveBeenCalled();
      expect(logError).not.toHaveBeenCalled();
    },
  );

  it(
    createTestName('load data best selling products chart failed when request missing field', HttpStatus.BAD_REQUEST),
    async () => {
      expect.hasAssertions();
      const payloadWithoutByField = {
        time: Date.now(),
      };
      const logError = jest.spyOn(productController as any, 'logError');
      const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(chartResponse));
      const loadDataBestSellingProductsChart = jest.spyOn(productService, 'loadDataBestSellingProductsChart');
      const response = await api
        .post(loadDataBestSellingProductsChartUrl)
        .set('mock-session', JSON.stringify(sessionPayload))
        .send(payloadWithoutByField)
        .expect(HttpStatus.BAD_REQUEST)
        .expect('Content-Type', /application\/json/);
      expect(response.body).toEqual({
        messages: expect.any(Array),
      });
      expect(loadDataBestSellingProductsChart).not.toHaveBeenCalled();
      expect(send).not.toHaveBeenCalled();
      expect(logError).not.toHaveBeenCalled();
    },
  );

  it(
    createTestName('load data best selling products chart failed when invalid select field', HttpStatus.BAD_REQUEST),
    async () => {
      expect.hasAssertions();
      const payloadWithInvalidBy = {
        time: Date.now(),
        by: '',
      };
      const logError = jest.spyOn(productController as any, 'logError');
      const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(chartResponse));
      const loadDataBestSellingProductsChart = jest.spyOn(productService, 'loadDataBestSellingProductsChart');
      const response = await api
        .post(loadDataBestSellingProductsChartUrl)
        .set('mock-session', JSON.stringify(sessionPayload))
        .send(payloadWithInvalidBy)
        .expect(HttpStatus.BAD_REQUEST)
        .expect('Content-Type', /application\/json/);
      expect(response.body).toEqual({
        messages: expect.any(Array),
      });
      expect(loadDataBestSellingProductsChart).not.toHaveBeenCalled();
      expect(send).not.toHaveBeenCalled();
      expect(logError).not.toHaveBeenCalled();
    },
  );

  it(
    createTestName('load data best selling products chart failed with output validate', HttpStatus.BAD_REQUEST),
    async () => {
      expect.hasAssertions();
      const logError = jest.spyOn(productController as any, 'logError');
      const validateErrors = [new ValidationError()];
      const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(chartResponse));
      jest.spyOn(BestSellingProductDataChart.prototype, 'validate').mockResolvedValue(validateErrors);
      const loadDataBestSellingProductsChart = jest.spyOn(productService, 'loadDataBestSellingProductsChart');
      await api
        .post(loadDataBestSellingProductsChartUrl)
        .set('mock-session', JSON.stringify(sessionPayload))
        .send(payload)
        .expect(HttpStatus.BAD_REQUEST)
        .expect('Content-Type', /application\/json/)
        .expect(createMessages(messages.COMMON.OUTPUT_VALIDATE));
      expect(loadDataBestSellingProductsChart).toHaveBeenCalledTimes(1);
      expect(send).toHaveBeenCalledTimes(1);
      expect(send).toHaveBeenCalledWith(loadDataBestSellingProductsChartPattern, payload);
      expect(logError).toHaveBeenCalledTimes(1);
      expect(logError).toHaveBeenCalledWith(validateErrors, expect.any(String));
    },
  );

  it(
    createTestName(
      'load data best selling products chart failed with database disconnect error',
      HttpStatus.BAD_REQUEST,
    ),
    async () => {
      expect.hasAssertions();
      const logError = jest.spyOn(productController as any, 'logError');
      const send = jest
        .spyOn(clientProxy, 'send')
        .mockReturnValue(throwError(() => new BadRequestException(PrismaDisconnectError.message)));
      const loadDataBestSellingProductsChart = jest.spyOn(productService, 'loadDataBestSellingProductsChart');
      await api
        .post(loadDataBestSellingProductsChartUrl)
        .set('mock-session', JSON.stringify(sessionPayload))
        .send(payload)
        .expect(HttpStatus.BAD_REQUEST)
        .expect('Content-Type', /application\/json/)
        .expect(createMessages(messages.COMMON.DATABASE_DISCONNECT));
      expect(loadDataBestSellingProductsChart).toHaveBeenCalledTimes(1);
      expect(send).toHaveBeenCalledTimes(1);
      expect(send).toHaveBeenCalledWith(loadDataBestSellingProductsChartPattern, payload);
      expect(logError).not.toHaveBeenCalled();
    },
  );

  it(
    createTestName('load data best selling products chart failed with server error', HttpStatus.INTERNAL_SERVER_ERROR),
    async () => {
      expect.hasAssertions();
      const logError = jest.spyOn(productController as any, 'logError');
      const serverError = new InternalServerErrorException();
      const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => serverError));
      const loadDataBestSellingProductsChart = jest.spyOn(productService, 'loadDataBestSellingProductsChart');
      await api
        .post(loadDataBestSellingProductsChartUrl)
        .set('mock-session', JSON.stringify(sessionPayload))
        .send(payload)
        .expect(HttpStatus.INTERNAL_SERVER_ERROR)
        .expect('Content-Type', /application\/json/)
        .expect(createMessages(serverError.message));
      expect(loadDataBestSellingProductsChart).toHaveBeenCalledTimes(1);
      expect(send).toHaveBeenCalledTimes(1);
      expect(send).toHaveBeenCalledWith(loadDataBestSellingProductsChartPattern, payload);
      expect(logError).not.toHaveBeenCalled();
    },
  );

  it(
    createTestName('load data best selling products chart failed with unknown error', HttpStatus.INTERNAL_SERVER_ERROR),
    async () => {
      expect.hasAssertions();
      const logError = jest.spyOn(productController as any, 'logError');
      const serverError = new InternalServerErrorException();
      const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => UnknownError));
      const loadDataBestSellingProductsChart = jest.spyOn(productService, 'loadDataBestSellingProductsChart');
      await api
        .post(loadDataBestSellingProductsChartUrl)
        .set('mock-session', JSON.stringify(sessionPayload))
        .send(payload)
        .expect(HttpStatus.INTERNAL_SERVER_ERROR)
        .expect('Content-Type', /application\/json/)
        .expect(createMessages(serverError.message));
      expect(loadDataBestSellingProductsChart).toHaveBeenCalledTimes(1);
      expect(send).toHaveBeenCalledTimes(1);
      expect(send).toHaveBeenCalledWith(loadDataBestSellingProductsChartPattern, payload);
      expect(logError).not.toHaveBeenCalled();
    },
  );

  it(
    createTestName('load data best selling products chart failed with rpc unknown error', HttpStatus.BAD_REQUEST),
    async () => {
      expect.hasAssertions();
      const logError = jest.spyOn(productController as any, 'logError');
      const send = jest
        .spyOn(clientProxy, 'send')
        .mockReturnValue(throwError(() => new BadRequestException(messages.COMMON.COMMON_ERROR)));
      const loadDataBestSellingProductsChart = jest.spyOn(productService, 'loadDataBestSellingProductsChart');
      await api
        .post(loadDataBestSellingProductsChartUrl)
        .set('mock-session', JSON.stringify(sessionPayload))
        .send(payload)
        .expect(HttpStatus.BAD_REQUEST)
        .expect('Content-Type', /application\/json/)
        .expect(createMessages(messages.COMMON.COMMON_ERROR));
      expect(loadDataBestSellingProductsChart).toHaveBeenCalledTimes(1);
      expect(send).toHaveBeenCalledTimes(1);
      expect(send).toHaveBeenCalledWith(loadDataBestSellingProductsChartPattern, payload);
      expect(logError).not.toHaveBeenCalled();
    },
  );
});

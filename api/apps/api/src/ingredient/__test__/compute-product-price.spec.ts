import TestAgent from 'supertest/lib/agent';
import { of, throwError } from 'rxjs';
import { BadRequestException, HttpStatus, InternalServerErrorException, RequestMethod } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Unit } from 'generated/prisma';
import { createDescribeTest, createTestName, getMockModule } from '@share/test/helpers';
import { HTTP_METHOD } from '@share/enums';
import { sessionPayload } from '@share/test/pre-setup/mock/data/user';
import IngredientService from '../ingredient.service';
import IngredientModule from '../ingredient.module';
import { computeProductPricePattern } from '@share/pattern';
import startUp from './pre-setup';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import { PrismaDisconnectError } from '@share/test/pre-setup/mock/errors/prisma-errors';
import messages from '@share/constants/messages';
import { createMessages } from '@share/utils';
import { IngredientRouter } from '@share/router';

const computeProductPriceUrl = IngredientRouter.absolute.computedProductPrice;

const MockIngredientModule = getMockModule(IngredientModule, {
  path: computeProductPriceUrl,
  method: RequestMethod.POST,
});

const price = 20000;
const requestBody = {
  temporaryProductId: '1234567890',
  productIngredients: [
    {
      ingredientId: '1757410124885',
      amount: 20,
      unit: Unit.GRAM,
    },
    {
      ingredientId: '1757582086529',
      amount: 2,
      unit: Unit.GRAM,
    },
  ],
};

let api: TestAgent;
let clientProxy: ClientProxy;
let close: () => Promise<void>;
let ingredientService: IngredientService;

beforeEach(async () => {
  const requestTest = await startUp(MockIngredientModule);
  api = requestTest.api;
  clientProxy = requestTest.clientProxy;
  close = () => requestTest.app.close();
  ingredientService = requestTest.app.get(IngredientService);
});

afterEach(async () => {
  if (close) {
    await close();
  }
});

describe(createDescribeTest(HTTP_METHOD.POST, computeProductPriceUrl), () => {
  it(createTestName('compute product price was success', HttpStatus.OK), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(price));
    const computeProductPrice = jest.spyOn(ingredientService, 'computeProductPrice');
    await api
      .post(computeProductPriceUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(requestBody)
      .expect(HttpStatus.OK)
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(price.toString());
    expect(computeProductPrice).toHaveBeenCalledTimes(1);
    expect(computeProductPrice).toHaveBeenCalledWith(requestBody);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(computeProductPricePattern, requestBody);
  });

  it(createTestName('compute product price failed with authentication error', HttpStatus.UNAUTHORIZED), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(price));
    const computeProductPrice = jest.spyOn(ingredientService, 'computeProductPrice');
    await api
      .post(computeProductPriceUrl)
      .send(requestBody)
      .expect(HttpStatus.UNAUTHORIZED)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.USER.DID_NOT_LOGIN));
    expect(computeProductPrice).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(createTestName('compute product price failed with undefined field', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send');
    const computeProductPrice = jest.spyOn(ingredientService, 'computeProductPrice');
    const requestBodyWithUndefinedField = {
      productIngredients: requestBody.productIngredients,
      productId: Date.now().toString(),
    };
    const response = await api
      .post(computeProductPriceUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(requestBodyWithUndefinedField)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/);
    expect(response.body).toEqual({ messages: expect.any(Array) });
    expect(computeProductPrice).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(createTestName('compute product price failed with missing field', HttpStatus.BAD_REQUEST), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send');
    const computeProductPrice = jest.spyOn(ingredientService, 'computeProductPrice');
    const requestBodyWithMissingField = {
      productIngredients: requestBody.productIngredients,
    };
    const response = await api
      .post(computeProductPriceUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(requestBodyWithMissingField)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/);
    expect(response.body).toEqual({ messages: expect.any(Array) });
    expect(computeProductPrice).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(createTestName('compute product price failed with unknown error', HttpStatus.INTERNAL_SERVER_ERROR), async () => {
    expect.hasAssertions();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => UnknownError));
    const computeProductPrice = jest.spyOn(ingredientService, 'computeProductPrice');
    await api
      .post(computeProductPriceUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(requestBody)
      .expect(HttpStatus.INTERNAL_SERVER_ERROR)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(new InternalServerErrorException().message));
    expect(computeProductPrice).toHaveBeenCalledTimes(1);
    expect(computeProductPrice).toHaveBeenCalledWith(requestBody);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(computeProductPricePattern, requestBody);
  });

  it(createTestName('compute product price failed with server error', HttpStatus.INTERNAL_SERVER_ERROR), async () => {
    expect.hasAssertions();
    const serverError = new InternalServerErrorException();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => serverError));
    const computeProductPrice = jest.spyOn(ingredientService, 'computeProductPrice');
    await api
      .post(computeProductPriceUrl)
      .set('mock-session', JSON.stringify(sessionPayload))
      .send(requestBody)
      .expect(HttpStatus.INTERNAL_SERVER_ERROR)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(serverError.message));
    expect(computeProductPrice).toHaveBeenCalledTimes(1);
    expect(computeProductPrice).toHaveBeenCalledWith(requestBody);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(computeProductPricePattern, requestBody);
  });

  it(
    createTestName('compute product price failed with database disconnect error', HttpStatus.BAD_REQUEST),
    async () => {
      expect.hasAssertions();
      const send = jest
        .spyOn(clientProxy, 'send')
        .mockReturnValue(throwError(() => new BadRequestException(PrismaDisconnectError.message)));
      const computeProductPrice = jest.spyOn(ingredientService, 'computeProductPrice');
      await api
        .post(computeProductPriceUrl)
        .set('mock-session', JSON.stringify(sessionPayload))
        .send(requestBody)
        .expect(HttpStatus.BAD_REQUEST)
        .expect('Content-Type', /application\/json/)
        .expect(createMessages(messages.COMMON.DATABASE_DISCONNECT));
      expect(computeProductPrice).toHaveBeenCalledTimes(1);
      expect(computeProductPrice).toHaveBeenCalledWith(requestBody);
      expect(send).toHaveBeenCalledTimes(1);
      expect(send).toHaveBeenCalledWith(computeProductPricePattern, requestBody);
    },
  );
});

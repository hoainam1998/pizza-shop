import TestAgent from 'supertest/lib/agent';
import { expect } from '@jest/globals';
import { of, throwError } from 'rxjs';
import { BadRequestException, HttpStatus, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { createDescribeTest, createTestName } from '@share/test/helpers';
import { HTTP_METHOD } from '@share/enums';
import IngredientService from '../ingredient.service';
import { deleteIngredientPattern } from '@share/pattern';
import startUp from './pre-setup';
import { ingredient } from '@share/test/pre-setup/mock/data/ingredient';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import { PrismaDisconnectError } from '@share/test/pre-setup/mock/errors/prisma-errors';
import messages from '@share/constants/messages';
import { createMessage, createMessages } from '@share/utils';
const ingredientId = ingredient.ingredient_id;
const baseUrl = '/ingredient/delete';
const deleteIngredientUrl = `${baseUrl}/${ingredientId}`;

let api: TestAgent;
let clientProxy: ClientProxy;
let close: () => Promise<void>;
let ingredientService: IngredientService;

beforeEach(async () => {
  const requestTest = await startUp();
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

describe(createDescribeTest(HTTP_METHOD.DELETE, baseUrl), () => {
  it(createTestName('delete ingredient success', HttpStatus.OK), async () => {
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(of(ingredient));
    const deleteIngredient = jest.spyOn(ingredientService, 'deleteIngredient');
    await api
      .delete(deleteIngredientUrl)
      .expect(HttpStatus.OK)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.INGREDIENT.DELETE_INGREDIENT_SUCCESS));
    expect(deleteIngredient).toHaveBeenCalledTimes(1);
    expect(deleteIngredient).toHaveBeenCalledWith(ingredientId);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(deleteIngredientPattern, ingredientId);
  });

  it(createTestName('delete ingredient failed with invalid id', HttpStatus.BAD_REQUEST), async () => {
    const send = jest.spyOn(clientProxy, 'send');
    const deleteIngredient = jest.spyOn(ingredientService, 'deleteIngredient');
    await api
      .delete(`${baseUrl}/xyz`)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.COMMON.VALIDATE_ID_FAIL));
    expect(deleteIngredient).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it(createTestName('delete ingredient failed with notfound error', HttpStatus.NOT_FOUND), async () => {
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new NotFoundException(messages.INGREDIENT.NOT_FOUND)));
    const deleteIngredient = jest.spyOn(ingredientService, 'deleteIngredient');
    await api
      .delete(deleteIngredientUrl)
      .expect(HttpStatus.NOT_FOUND)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.INGREDIENT.NOT_FOUND));
    expect(deleteIngredient).toHaveBeenCalledTimes(1);
    expect(deleteIngredient).toHaveBeenCalledWith(ingredientId);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(deleteIngredientPattern, ingredientId);
  });

  it(createTestName('delete ingredient failed with rpc unknown error', HttpStatus.BAD_REQUEST), async () => {
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new BadRequestException(createMessage(messages.COMMON.COMMON_ERROR))));
    const deleteIngredient = jest.spyOn(ingredientService, 'deleteIngredient');
    await api
      .delete(deleteIngredientUrl)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.COMMON.COMMON_ERROR));
    expect(deleteIngredient).toHaveBeenCalledTimes(1);
    expect(deleteIngredient).toHaveBeenCalledWith(ingredientId);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(deleteIngredientPattern, ingredientId);
  });

  it(createTestName('delete ingredient failed with unknown error', HttpStatus.BAD_REQUEST), async () => {
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => UnknownError));
    const deleteIngredient = jest.spyOn(ingredientService, 'deleteIngredient');
    await api
      .delete(deleteIngredientUrl)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(UnknownError.message));
    expect(deleteIngredient).toHaveBeenCalledTimes(1);
    expect(deleteIngredient).toHaveBeenCalledWith(ingredientId);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(deleteIngredientPattern, ingredientId);
  });

  it(createTestName('delete ingredient failed with database disconnect error', HttpStatus.BAD_REQUEST), async () => {
    const send = jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new BadRequestException(PrismaDisconnectError.message)));
    const deleteIngredient = jest.spyOn(ingredientService, 'deleteIngredient');
    await api
      .delete(deleteIngredientUrl)
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(messages.COMMON.DATABASE_DISCONNECT));
    expect(deleteIngredient).toHaveBeenCalledTimes(1);
    expect(deleteIngredient).toHaveBeenCalledWith(ingredientId);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(deleteIngredientPattern, ingredientId);
  });

  it(createTestName('delete ingredient failed with server error', HttpStatus.INTERNAL_SERVER_ERROR), async () => {
    const serverError = new InternalServerErrorException();
    const send = jest.spyOn(clientProxy, 'send').mockReturnValue(throwError(() => serverError));
    const deleteIngredient = jest.spyOn(ingredientService, 'deleteIngredient');
    await api
      .delete(deleteIngredientUrl)
      .expect(HttpStatus.INTERNAL_SERVER_ERROR)
      .expect('Content-Type', /application\/json/)
      .expect(createMessages(serverError.message));
    expect(deleteIngredient).toHaveBeenCalledTimes(1);
    expect(deleteIngredient).toHaveBeenCalledWith(ingredientId);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(deleteIngredientPattern, ingredientId);
  });
});

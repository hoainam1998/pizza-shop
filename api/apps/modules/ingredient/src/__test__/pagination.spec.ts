import { BadRequestException, NotFoundException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaClient } from 'generated/prisma';
import startUp from './pre-setup';
import IngredientService from '../ingredient.service';
import IngredientController from '../ingredient.controller';
import { PRISMA_CLIENT } from '@share/di-token';
import LoggingService from '@share/libs/logging/logging.service';
import { calcSkip, createMessage } from '@share/utils';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import messages from '@share/constants/messages';
import { PrismaDisconnectError } from '@share/test/pre-setup/mock/errors/prisma-errors';
import { createIngredients, ingredient } from '@share/test/pre-setup/mock/data/ingredient';

let ingredientController: IngredientController;
let ingredientService: IngredientService;
let prismaService: PrismaClient;
let loggerService: LoggingService;

const query = {
  ingredient_id: true,
  name: true,
  avatar: true,
  unit: true,
  count: true,
  expired_time: true,
  status: true,
  price: true,
  _count: {
    select: {
      product_ingredient: true,
    },
  },
};

const paginationBody: any = {
  pageSize: 10,
  pageNumber: 1,
  query,
};
const length = 2;
const ingredients = createIngredients(length);
const skip = calcSkip(paginationBody.pageSize, paginationBody.pageNumber);

beforeEach(async () => {
  const moduleRef = await startUp();

  ingredientService = moduleRef.get(IngredientService);
  ingredientController = moduleRef.get(IngredientController);
  loggerService = moduleRef.get(LoggingService);
  prismaService = moduleRef.get(PRISMA_CLIENT);
});

describe('ingredient pagination', () => {
  it('ingredient pagination was success', async () => {
    expect.hasAssertions();
    const transactionResults = [ingredients, length];
    const findManyPrismaMethod = jest.spyOn(prismaService.ingredient, 'findMany');
    const countPrismaMethod = jest.spyOn(prismaService.ingredient, 'count');
    const transactionPrismaMethod = jest.spyOn(prismaService, '$transaction').mockResolvedValue(transactionResults);
    const paginationServiceMethod = jest.spyOn(ingredientService, 'pagination');
    const paginationControllerMethod = jest.spyOn(ingredientController, 'pagination');
    await expect(ingredientController.pagination(paginationBody)).resolves.toEqual({
      list: transactionResults[0],
      total: transactionResults[1],
    });
    expect(paginationControllerMethod).toHaveBeenCalledTimes(1);
    expect(paginationControllerMethod).toHaveBeenCalledWith(paginationBody);
    expect(paginationServiceMethod).toHaveBeenCalledTimes(1);
    expect(paginationServiceMethod).toHaveBeenCalledWith(paginationBody);
    expect(transactionPrismaMethod).toHaveBeenCalledTimes(1);
    expect(transactionPrismaMethod).toHaveBeenCalledWith(expect.any(Array));
    expect(findManyPrismaMethod).toHaveBeenCalledTimes(1);
    expect(findManyPrismaMethod).toHaveBeenCalledWith({
      select: paginationBody.query,
      take: paginationBody.pageSize,
      skip,
      where: {},
      orderBy: {
        ingredient_id: 'desc',
      },
    });
    expect(countPrismaMethod).toHaveBeenCalledTimes(1);
    expect(countPrismaMethod).toHaveBeenCalledWith({ where: {} });
  });

  it('ingredient pagination was success with keyword', async () => {
    expect.hasAssertions();
    const paginationBodyWithKeyword = {
      ...paginationBody,
      search: ingredient.name,
    };
    const transactionResults = [ingredients, length];
    const findManyPrismaMethod = jest.spyOn(prismaService.ingredient, 'findMany');
    const countPrismaMethod = jest.spyOn(prismaService.ingredient, 'count');
    const transactionPrismaMethod = jest.spyOn(prismaService, '$transaction').mockResolvedValue(transactionResults);
    const paginationServiceMethod = jest.spyOn(ingredientService, 'pagination');
    const paginationControllerMethod = jest.spyOn(ingredientController, 'pagination');
    await expect(ingredientController.pagination(paginationBodyWithKeyword)).resolves.toEqual({
      list: transactionResults[0],
      total: transactionResults[1],
    });
    expect(paginationControllerMethod).toHaveBeenCalledTimes(1);
    expect(paginationControllerMethod).toHaveBeenCalledWith(paginationBodyWithKeyword);
    expect(paginationServiceMethod).toHaveBeenCalledTimes(1);
    expect(paginationServiceMethod).toHaveBeenCalledWith(paginationBodyWithKeyword);
    expect(transactionPrismaMethod).toHaveBeenCalledTimes(1);
    expect(transactionPrismaMethod).toHaveBeenCalledWith(expect.any(Array));
    expect(findManyPrismaMethod).toHaveBeenCalledTimes(1);
    expect(findManyPrismaMethod).toHaveBeenCalledWith({
      select: paginationBodyWithKeyword.query,
      take: paginationBodyWithKeyword.pageSize,
      skip,
      where: {
        name: {
          contains: paginationBodyWithKeyword.search,
        },
      },
      orderBy: {
        ingredient_id: 'desc',
      },
    });
    expect(countPrismaMethod).toHaveBeenCalledTimes(1);
    expect(countPrismaMethod).toHaveBeenCalledWith({
      where: {
        name: {
          contains: paginationBodyWithKeyword.search,
        },
      },
    });
  });

  it('ingredient pagination failed with not found error', async () => {
    expect.hasAssertions();
    const findManyPrismaMethod = jest.spyOn(prismaService.ingredient, 'findMany');
    const countPrismaMethod = jest.spyOn(prismaService.ingredient, 'count');
    const transactionPrismaMethod = jest.spyOn(prismaService, '$transaction').mockResolvedValue([[], 0]);
    const paginationServiceMethod = jest.spyOn(ingredientService, 'pagination');
    const paginationControllerMethod = jest.spyOn(ingredientController, 'pagination');
    await expect(ingredientController.pagination(paginationBody)).rejects.toThrow(
      new RpcException(
        new NotFoundException({
          list: [],
          total: 0,
        }),
      ),
    );
    expect(paginationControllerMethod).toHaveBeenCalledTimes(1);
    expect(paginationControllerMethod).toHaveBeenCalledWith(paginationBody);
    expect(paginationServiceMethod).toHaveBeenCalledTimes(1);
    expect(paginationServiceMethod).toHaveBeenCalledWith(paginationBody);
    expect(transactionPrismaMethod).toHaveBeenCalledTimes(1);
    expect(transactionPrismaMethod).toHaveBeenCalledWith(expect.any(Array));
    expect(findManyPrismaMethod).toHaveBeenCalledTimes(1);
    expect(findManyPrismaMethod).toHaveBeenCalledWith({
      select: paginationBody.query,
      take: paginationBody.pageSize,
      skip,
      where: {},
      orderBy: {
        ingredient_id: 'desc',
      },
    });
    expect(countPrismaMethod).toHaveBeenCalledTimes(1);
    expect(countPrismaMethod).toHaveBeenCalledWith({ where: {} });
  });

  it('ingredient pagination failed with unknown error', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const findManyPrismaMethod = jest.spyOn(prismaService.ingredient, 'findMany');
    const countPrismaMethod = jest.spyOn(prismaService.ingredient, 'count');
    const transactionPrismaMethod = jest.spyOn(prismaService, '$transaction').mockRejectedValue(UnknownError);
    const paginationServiceMethod = jest.spyOn(ingredientService, 'pagination');
    const paginationControllerMethod = jest.spyOn(ingredientController, 'pagination');
    await expect(ingredientController.pagination(paginationBody)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(messages.COMMON.COMMON_ERROR))),
    );
    expect(paginationControllerMethod).toHaveBeenCalledTimes(1);
    expect(paginationControllerMethod).toHaveBeenCalledWith(paginationBody);
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(UnknownError.message, expect.any(String));
    expect(paginationServiceMethod).toHaveBeenCalledTimes(1);
    expect(paginationServiceMethod).toHaveBeenCalledWith(paginationBody);
    expect(transactionPrismaMethod).toHaveBeenCalledTimes(1);
    expect(transactionPrismaMethod).toHaveBeenCalledWith(expect.any(Array));
    expect(findManyPrismaMethod).toHaveBeenCalledTimes(1);
    expect(findManyPrismaMethod).toHaveBeenCalledWith({
      select: paginationBody.query,
      take: paginationBody.pageSize,
      skip,
      where: {},
      orderBy: {
        ingredient_id: 'desc',
      },
    });
    expect(countPrismaMethod).toHaveBeenCalledTimes(1);
    expect(countPrismaMethod).toHaveBeenCalledWith({ where: {} });
  });

  it('ingredient pagination failed with database disconnect error', async () => {
    expect.hasAssertions();
    const logMethod = jest.spyOn(loggerService, 'error');
    const findManyPrismaMethod = jest.spyOn(prismaService.ingredient, 'findMany');
    const countPrismaMethod = jest.spyOn(prismaService.ingredient, 'count');
    const transactionPrismaMethod = jest.spyOn(prismaService, '$transaction').mockRejectedValue(PrismaDisconnectError);
    const paginationServiceMethod = jest.spyOn(ingredientService, 'pagination');
    const paginationControllerMethod = jest.spyOn(ingredientController, 'pagination');
    await expect(ingredientController.pagination(paginationBody)).rejects.toThrow(
      new RpcException(new BadRequestException(createMessage(PrismaDisconnectError.message))),
    );
    expect(paginationControllerMethod).toHaveBeenCalledTimes(1);
    expect(paginationControllerMethod).toHaveBeenCalledWith(paginationBody);
    expect(logMethod).toHaveBeenCalledTimes(1);
    expect(logMethod).toHaveBeenCalledWith(PrismaDisconnectError.message, expect.any(String));
    expect(paginationServiceMethod).toHaveBeenCalledTimes(1);
    expect(paginationServiceMethod).toHaveBeenCalledWith(paginationBody);
    expect(transactionPrismaMethod).toHaveBeenCalledTimes(1);
    expect(transactionPrismaMethod).toHaveBeenCalledWith(expect.any(Array));
    expect(findManyPrismaMethod).toHaveBeenCalledTimes(1);
    expect(findManyPrismaMethod).toHaveBeenCalledWith({
      select: paginationBody.query,
      take: paginationBody.pageSize,
      skip,
      where: {},
      orderBy: {
        ingredient_id: 'desc',
      },
    });
    expect(countPrismaMethod).toHaveBeenCalledTimes(1);
    expect(countPrismaMethod).toHaveBeenCalledWith({ where: {} });
  });
});

import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import prisma, { PrismaClient, Unit } from 'generated/prisma';
import { PRISMA_CLIENT } from '@share/di-token';
import SchedulerService from '@share/libs/scheduler/scheduler.service';
import {
  type ProductIngredientType,
  type IngredientSelectType,
  IngredientPaginationPrismaResponseType,
} from '@share/interfaces';
import IngredientCachingService from '@share/libs/caching/ingredient/ingredient.service';
import { HandlePrismaError } from '@share/decorators';
import { calcSkip, selectFields } from '@share/utils';
import messages from '@share/constants/messages';
import { IngredientPaginationSelect } from '@share/dto/validators/ingredient.dto';

@Injectable()
export default class IngredientService {
  private readonly _jobName = 'delete_expired_ingredient';

  constructor(
    @Inject(PRISMA_CLIENT) private readonly prismaClient: PrismaClient,
    private readonly ingredientCachingService: IngredientCachingService,
    private readonly schedulerService: SchedulerService,
  ) {}

  private delete(ingredientId: string): Promise<prisma.ingredient> {
    return this.prismaClient.product_ingredient
      .findMany({
        where: {
          ingredient_id: ingredientId,
        },
        select: {
          product_id: true,
        },
      })
      .then((products) => {
        const productIds = products.map((p) => p.product_id);
        return this.prismaClient
          .$transaction([
            this.prismaClient.product_ingredient.deleteMany({
              where: {
                product_id: {
                  in: productIds,
                },
              },
            }),
            this.prismaClient.ingredient.delete({
              where: {
                ingredient_id: ingredientId,
              },
            }),
            this.prismaClient.product.deleteMany({
              where: {
                product_id: {
                  in: productIds,
                },
              },
            }),
          ])
          .then((results) => results[1]);
      });
  }

  private deleteIngredientExpired(ingredient: prisma.ingredient, actionName: string): void {
    this.schedulerService.deleteItemExpired(
      +ingredient.expired_time,
      () => this.delete(ingredient.ingredient_id),
      this._jobName,
      actionName,
    );
  }

  @HandlePrismaError(messages.INGREDIENT)
  createIngredient(ingredient: prisma.ingredient): Promise<prisma.ingredient> {
    return this.prismaClient.ingredient
      .create({
        data: ingredient,
      })
      .then(async (ingredient) => {
        await this.ingredientCachingService.deleteAllIngredients();
        this.deleteIngredientExpired(ingredient, this.createIngredient.name);
        return ingredient;
      });
  }

  @HandlePrismaError(messages.INGREDIENT)
  deleteIngredient(ingredientId: string): Promise<prisma.ingredient> {
    return this.delete(ingredientId).then(async (ingredient) => {
      this.schedulerService.deleteScheduler(this._jobName, this.deleteIngredient.name);
      await this.ingredientCachingService.deleteAllIngredients();
      return ingredient;
    });
  }

  @HandlePrismaError(messages.INGREDIENT)
  async computeProductIngredients(
    temporaryProductId: string,
    productIngredients: ProductIngredientType[],
  ): Promise<number> {
    const ingredientIds: string[] = productIngredients.map((ingredientItem) => ingredientItem.ingredientId);
    let missingIngredientIds: string[] = ingredientIds;
    let ingredientsFormRedis: (string | null)[] = await this.ingredientCachingService.getProductIngredientsStored(
      temporaryProductId,
      ingredientIds,
    );

    if (ingredientIds.length > 0) {
      missingIngredientIds = ingredientsFormRedis.reduce<string[]>((missingList, ingredient, index) => {
        if (!ingredient) {
          missingList.push(ingredientIds[index]);
        }
        return missingList;
      }, []);
    }

    ingredientsFormRedis = ingredientsFormRedis.filter((i) => i);
    let ingredientSelected = ingredientsFormRedis.map((i) => JSON.parse(i!));

    if (missingIngredientIds.length) {
      ingredientSelected = await this.prismaClient.ingredient
        .findMany({
          where: {
            ingredient_id: {
              in: missingIngredientIds,
            },
          },
          select: {
            name: true,
            ingredient_id: true,
            price: true,
            unit: true,
          },
        })
        .then(async (result) => {
          const resultAfterMerged = [...ingredientSelected, ...result];
          const sortedSetData = result.reduce(
            (o, ingredientItem) => {
              o[ingredientItem.ingredient_id] = JSON.stringify({
                ingredient_id: ingredientItem.ingredient_id,
                name: ingredientItem.name,
                price: ingredientItem.price,
                unit: ingredientItem.unit,
              });
              return o;
            },
            {} as Record<string, string>,
          );

          if (Object.keys(sortedSetData).length) {
            await this.ingredientCachingService.storeProductIngredients(temporaryProductId, sortedSetData);
          }

          return resultAfterMerged;
        });
    }

    return productIngredients.reduce<number>((price, ingredientItem) => {
      const currentIngredientSelected = ingredientSelected.find(
        (ingredient) => ingredient.ingredient_id === ingredientItem.ingredientId,
      );
      if (currentIngredientSelected) {
        if (ingredientItem.unit === currentIngredientSelected.unit) {
          price += ingredientItem.amount * +currentIngredientSelected.price;
        } else {
          if (ingredientItem.unit === Unit.GRAM && currentIngredientSelected.unit === Unit.KG) {
            price += (ingredientItem.amount / 1000) * +currentIngredientSelected.price;
          } else {
            throw new RpcException(new BadRequestException(`${currentIngredientSelected.name} have wrong unit!`));
          }
        }
      }
      return price;
    }, 0);
  }

  private async storeCacheIngredients(): Promise<prisma.ingredient[]> {
    const ingredients = await this.prismaClient.ingredient.findMany({
      select: {
        ingredient_id: true,
        name: true,
        price: true,
        avatar: true,
        count: true,
        unit: true,
        expired_time: true,
        status: true,
        _count: {
          select: {
            product_ingredient: true,
          },
        },
      },
    });
    await this.ingredientCachingService.storeAllIngredients(ingredients);
    return ingredients;
  }

  @HandlePrismaError(messages.INGREDIENT)
  async getAll(select: IngredientSelectType): Promise<Partial<prisma.ingredient>[]> {
    let ingredients: prisma.ingredient[] = [];
    if (await this.ingredientCachingService.checkExists()) {
      ingredients = await this.ingredientCachingService.getAllIngredients();
    } else {
      ingredients = await this.storeCacheIngredients();
    }
    return selectFields<IngredientSelectType, prisma.ingredient>(select, ingredients);
  }

  @HandlePrismaError(messages.INGREDIENT)
  pagination(select: IngredientPaginationSelect): Promise<IngredientPaginationPrismaResponseType> {
    const skip = calcSkip(select.pageSize, select.pageNumber);
    const condition = select.search
      ? {
          name: {
            contains: select.search,
          },
        }
      : {};
    return this.prismaClient.$transaction([
      this.prismaClient.ingredient.findMany({
        take: select.pageSize,
        skip,
        select: select.query,
        where: condition,
        orderBy: {
          ingredient_id: 'desc',
        },
      }),
      this.prismaClient.ingredient.count({
        where: condition,
      }),
    ]);
  }
}

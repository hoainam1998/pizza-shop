import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ingredient, PrismaClient, Unit } from 'generated/prisma';
import { PRISMA_CLIENT, REDIS_CLIENT } from '@share/di-token';
import RedisClient from '@share/libs/redis-client/redis';
import { type ProductIngredientType, type IngredientSelectType } from '@share/interfaces';

@Injectable()
export default class IngredientService {
  constructor(
    @Inject(PRISMA_CLIENT) private readonly prismaClient: PrismaClient,
    @Inject(REDIS_CLIENT) private readonly redisClient: RedisClient,
  ) {}

  createIngredient(ingredient: ingredient): Promise<ingredient> {
    return this.prismaClient.ingredient.create({
      data: ingredient,
    });
  }

  async computeProductIngredients(
    temporaryProductId: string,
    productIngredients: ProductIngredientType[],
  ): Promise<number> {
    const ingredientIds: string[] = productIngredients.map((ingredientItem) => ingredientItem.id);
    let missingIngredients: string[] = ingredientIds;
    let ingredientsFormRedis: (string | null)[] = await this.redisClient.Client.hmGet(
      `ingredient_${temporaryProductId}`,
      ingredientIds.map((id) => id.toString()),
    ).catch((error) => {
      throw error;
    });

    if (ingredientIds.length > 0) {
      missingIngredients = ingredientsFormRedis.reduce<string[]>((missingList, i, index) => {
        if (!i) {
          missingList.push(ingredientIds[index]);
        }
        return missingList;
      }, []);
    }

    ingredientsFormRedis = ingredientsFormRedis.filter((i) => i);

    return this.prismaClient.ingredient
      .findMany({
        where: {
          ingredient_id: {
            in: missingIngredients,
          },
        },
        select: {
          name: true,
          ingredient_id: true,
          price: true,
          unit: true,
        },
      })
      .then((result) => {
        const jsonIngredients = ingredientsFormRedis.map((i) => JSON.parse(i!));
        const resultAfterMerged = [...jsonIngredients, ...result];
        const sortedSetData = result.reduce(
          (o, ingredientItem) => {
            o[ingredientItem.ingredient_id] = JSON.stringify({
              name: ingredientItem.name,
              price: ingredientItem.price,
              unit: ingredientItem.unit,
            });
            return o;
          },
          {} as Record<string, string>,
        );

        if (Object.keys(sortedSetData).length) {
          this.redisClient.Client.hSet(`ingredient_${temporaryProductId}`, sortedSetData).catch((error) => {
            throw error;
          });
        }

        return productIngredients.reduce((price, ingredientItem, index) => {
          if (ingredientItem.unit === resultAfterMerged[index].unit) {
            price += ingredientItem.amount * resultAfterMerged[index].price;
          } else {
            if (ingredientItem.unit === Unit.GRAM && resultAfterMerged[index].unit === Unit.KG) {
              price += (ingredientItem.amount / 1000) * resultAfterMerged[index].price;
            } else {
              throw new BadRequestException(`${resultAfterMerged[index].name} have wrong unit!`);
            }
          }
          return price;
        }, 0);
      });
  }

  getAll(select: IngredientSelectType): Promise<ingredient[]> {
    return this.prismaClient.ingredient.findMany({
      select: {
        ingredient_id: true,
        ...select,
      },
    });
  }
}

import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ingredient, PrismaClient, Unit } from 'generated/prisma';
import { PRISMA_CLIENT } from '@share/di-token';
import { type ProductIngredientType, type IngredientSelectType } from '@share/interfaces';
import IngredientCachingService from '@share/libs/caching/ingredient/ingredient.service';
import { HandlePrismaError } from '@share/decorators';
import messages from '@share/constants/messages';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export default class IngredientService {
  constructor(
    @Inject(PRISMA_CLIENT) private readonly prismaClient: PrismaClient,
    private readonly ingredientCachingService: IngredientCachingService,
  ) {}

  createIngredient(ingredient: ingredient): Promise<ingredient> {
    return this.prismaClient.ingredient.create({
      data: ingredient,
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

  getAll(select: IngredientSelectType): Promise<ingredient[]> {
    return this.prismaClient.ingredient.findMany({
      select: {
        ingredient_id: true,
        ...select,
      },
    });
  }
}

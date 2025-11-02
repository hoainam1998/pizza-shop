import { Injectable } from '@nestjs/common';
import CachingService from '../caching';
import constants from '@share/constants';
import { ingredient } from 'generated/prisma';
const ingredientKey = constants.REDIS_PREFIX.INGREDIENTS;

export const ingredientName = (id: string) => `ingredient_${id}`;

@Injectable()
export default class IngredientCachingService extends CachingService {
  storeProductIngredients(productId: string, data: Record<string, string>): Promise<number> {
    return this.RedisClientInstance.hSet(ingredientName(productId), data);
  }

  getProductIngredientsStored(productId: string, ingredientIds: string[]): Promise<(string | null)[]> {
    return this.RedisClientInstance.hmGet(ingredientName(productId), ingredientIds);
  }

  deleteAllProductIngredients(productId: string): Promise<number> {
    return this.RedisClientInstance.del(ingredientName(productId));
  }

  checkExists(): Promise<boolean> {
    return this.exists(ingredientKey);
  }

  storeAllIngredients(ingredients: ingredient[]): Promise<'OK' | null> {
    return this.jsonSet(ingredientKey, ingredients);
  }

  getAllIngredients(): Promise<ingredient[]> {
    return this.jsonGet(ingredientKey);
  }

  deleteAllIngredients(): Promise<number> {
    return this.RedisClientInstance.del(ingredientKey);
  }
}

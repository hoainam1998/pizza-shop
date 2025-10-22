import { Inject, Injectable } from '@nestjs/common';
import { REDIS_CLIENT } from '@share/di-token';
import RedisClient from '@share/libs/redis-client/redis';

export const ingredientName = (id: string) => `ingredient_${id}`;

@Injectable()
export default class IngredientCachingService {
  constructor(@Inject(REDIS_CLIENT) private readonly redisClient: RedisClient) {}

  storeProductIngredients(productId: string, data: Record<string, string>): Promise<number> {
    return this.redisClient.Client.hSet(ingredientName(productId), data).catch((error) => {
      throw error;
    });
  }

  getProductIngredientsStored(productId: string, ingredientIds: string[]): Promise<(string | null)[]> {
    return this.redisClient.Client.hmGet(ingredientName(productId), ingredientIds).catch((error) => {
      throw error;
    });
  }

  deleteAllProductIngredients(productId: string): Promise<number> {
    return this.redisClient.Client.del(ingredientName(productId));
  }
}

import { Inject, Injectable } from '@nestjs/common';
import { REDIS_CLIENT } from '@share/di-token';
import RedisClient from '@share/libs/redis-client/redis';
import constants from '@share/constants';
import { category } from 'generated/prisma';
const categoryKey = constants.REDIS_PREFIX.CATEGORIES;

@Injectable()
export default class CategoryCachingService {
  constructor(@Inject(REDIS_CLIENT) private readonly redisClient: RedisClient) {}

  storeAllCategories(categories: category[]): Promise<'OK' | null> {
    return this.redisClient.Client.json.set(categoryKey, '$', categories);
  }

  checkExist(): Promise<boolean> {
    return this.redisClient.Client.exists(categoryKey).then((result) => result > 0);
  }

  getAllCategories(): Promise<category[]> {
    return this.redisClient.Client.json.get(categoryKey, { path: '$' }).then((result: Array<category[]>) => result[0]);
  }

  deleteAllCategories(): Promise<number> {
    return this.redisClient.Client.del(categoryKey);
  }
}

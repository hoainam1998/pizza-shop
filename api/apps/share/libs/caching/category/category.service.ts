import { Inject, Injectable } from '@nestjs/common';
import { REDIS_CLIENT } from '@share/di-token';
import RedisClient from '@share/libs/redis-client/redis';
import constants from '@share/constants';
import { category } from 'generated/prisma';

@Injectable()
export default class CategoryCachingService {
  constructor(@Inject(REDIS_CLIENT) private readonly redisClient: RedisClient) {}

  storeAllCategories(categories: category[]): ReturnType<typeof this.redisClient.Client.json.set> {
    return this.redisClient.Client.json.set(constants.REDIS_PREFIX.CATEGORIES, '$', categories);
  }

  checkExist(): Promise<boolean> {
    return this.redisClient.Client.exists(constants.REDIS_PREFIX.CATEGORIES).then((result) => result > 0);
  }

  getAllCategories(): Promise<category[]> {
    return this.redisClient.Client.json
      .get(constants.REDIS_PREFIX.CATEGORIES, { path: '$' })
      .then((result: Array<category[]>) => result[0]);
  }
}

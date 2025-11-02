import { Injectable } from '@nestjs/common';
import constants from '@share/constants';
import CachingService from '../caching';
import { category } from 'generated/prisma';
const categoryKey = constants.REDIS_PREFIX.CATEGORIES;

@Injectable()
export default class CategoryCachingService extends CachingService {
  storeAllCategories(categories: category[]): Promise<'OK' | null> {
    return this.jsonSet(categoryKey, categories);
  }

  checkExists(): Promise<boolean> {
    return this.exists(categoryKey);
  }

  getAllCategories(): Promise<category[]> {
    return this.jsonGet(categoryKey);
  }

  deleteAllCategories(): Promise<number> {
    return this.RedisClientInstance.del(categoryKey);
  }
}

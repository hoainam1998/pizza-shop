import { Injectable } from '@nestjs/common';
import CachingService from '../caching';
import constants from '@share/constants';

/**
 * Generate user-product redis key.
 *
 * @param {string} userId - A user id
 * @returns {string} A user-product redis key.
 */
export const userProductKey = (userId: string) => `${constants.REDIS_PREFIX.USER_PRODUCT}${userId}`;

/**
 * Generate product redis key.
 *
 * @param {string} userId - The product id
 * @returns {string} A product redis key.
 */
export const productKey = (productId: string) => `${constants.REDIS_PREFIX.PRODUCT}${productId}`;

@Injectable()
export default class ProductCachingService extends CachingService {
  checkExists(productId: string): Promise<boolean> {
    return this.exists(productId);
  }

  setVisitor(productId: string, userId: string): Promise<number> {
    const key = productKey(productId);
    return this.RedisClientInstance.sAdd(key, userId);
  }

  setProductsAccessByVisitor(productIds: string[], userId: string): Promise<number> {
    const key = userProductKey(userId);
    return this.RedisClientInstance.sAdd(key, productIds);
  }

  getVisitor(productId: string): Promise<string[]> {
    const key = productKey(productId);
    return this.RedisClientInstance.sMembers(key);
  }

  getProductsAccessByVisitor(userId: string): Promise<string[]> {
    const key = userProductKey(userId);
    return this.RedisClientInstance.sMembers(key);
  }

  removeVisitor(productId: string, userId: string): Promise<number> {
    const key = productKey(productId);
    return this.RedisClientInstance.sRem(key, userId);
  }

  removeAllVisitorOfProduct(productId: string): Promise<number> {
    const key = productKey(productId);
    return this.RedisClientInstance.del(key);
  }

  removeProductAccessByVisitor(productId: string, userId: string): Promise<number> {
    const key = userProductKey(userId);
    return this.RedisClientInstance.sRem(key, productId);
  }

  removeProductsAccessByVisitor(userId: string): Promise<number> {
    const key = userProductKey(userId);
    return this.RedisClientInstance.del(key);
  }
}

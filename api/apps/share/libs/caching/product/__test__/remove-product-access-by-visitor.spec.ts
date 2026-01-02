import ProductCachingService, { userProductKey } from '../product.service';
import { REDIS_CLIENT } from '@share/di-token';
import startUp from './pre-setup';
import RedisClient from '@share/libs/redis-client/redis';
import { product } from '@share/test/pre-setup/mock/data/product';
import { user } from '@share/test/pre-setup/mock/data/user';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';

let productCachingService: ProductCachingService;
let redisClient: RedisClient;
const result = 1;

beforeEach(async () => {
  const moduleRef = await startUp();
  productCachingService = moduleRef.get(ProductCachingService);
  redisClient = moduleRef.get(REDIS_CLIENT);
});

describe('remove product access by visitor', () => {
  it('remove product access by visitor success', async () => {
    expect.hasAssertions();
    const key = userProductKey(user.user_id);
    const sRem = jest.spyOn(redisClient.Client, 'sRem').mockResolvedValue(result);
    await expect(
      productCachingService.removeProductAccessByVisitor(product.product_id as string, user.user_id),
    ).resolves.toBe(result);
    expect(sRem).toHaveBeenCalledTimes(1);
    expect(sRem).toHaveBeenCalledWith(key, product.product_id);
  });

  it('remove product access by visitor failed with unknown error', async () => {
    expect.hasAssertions();
    const key = userProductKey(user.user_id);
    const sRem = jest.spyOn(redisClient.Client, 'sRem').mockRejectedValue(UnknownError);
    await expect(
      productCachingService.removeProductAccessByVisitor(product.product_id as string, user.user_id),
    ).rejects.toThrow(UnknownError);
    expect(sRem).toHaveBeenCalledTimes(1);
    expect(sRem).toHaveBeenCalledWith(key, product.product_id);
  });
});

import ProductCachingService, { productKey } from '../product.service';
import { REDIS_CLIENT } from '@share/di-token';
import startUp from './pre-setup';
import RedisClient from '@share/libs/redis-client/redis';
import { product } from '@share/test/pre-setup/mock/data/product';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';

let productCachingService: ProductCachingService;
let redisClient: RedisClient;
const visitors = [Date.now().toString(), (Date.now() + 1).toString()];

beforeEach(async () => {
  const moduleRef = await startUp();
  productCachingService = moduleRef.get(ProductCachingService);
  redisClient = moduleRef.get(REDIS_CLIENT);
});

describe('get visitor', () => {
  it('get visitor success', async () => {
    expect.hasAssertions();
    const key = productKey(product.product_id as string);
    const sMembers = jest.spyOn(redisClient.Client, 'sMembers').mockResolvedValue(visitors);
    await expect(productCachingService.getVisitor(product.product_id as string)).resolves.toBe(visitors);
    expect(sMembers).toHaveBeenCalledTimes(1);
    expect(sMembers).toHaveBeenCalledWith(key);
  });

  it('get visitor failed with unknown error', async () => {
    expect.hasAssertions();
    const key = productKey(product.product_id as string);
    const sMembers = jest.spyOn(redisClient.Client, 'sMembers').mockRejectedValue(UnknownError);
    await expect(productCachingService.getVisitor(product.product_id as string)).rejects.toThrow(UnknownError);
    expect(sMembers).toHaveBeenCalledTimes(1);
    expect(sMembers).toHaveBeenCalledWith(key);
  });
});

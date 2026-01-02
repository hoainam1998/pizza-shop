import ProductCachingService, { productKey } from '../product.service';
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

describe('set visitor', () => {
  it('set visitor success', async () => {
    expect.hasAssertions();
    const key = productKey(product.product_id as string);
    const sAdd = jest.spyOn(redisClient.Client, 'sAdd').mockResolvedValue(result);
    await expect(productCachingService.setVisitor(product.product_id as string, user.user_id)).resolves.toBe(result);
    expect(sAdd).toHaveBeenCalledTimes(1);
    expect(sAdd).toHaveBeenCalledWith(key, user.user_id);
  });

  it('set visitor failed with unknown error', async () => {
    expect.hasAssertions();
    const key = productKey(product.product_id as string);
    const sAdd = jest.spyOn(redisClient.Client, 'sAdd').mockRejectedValue(UnknownError);
    await expect(productCachingService.setVisitor(product.product_id as string, user.user_id)).rejects.toThrow(
      UnknownError,
    );
    expect(sAdd).toHaveBeenCalledTimes(1);
    expect(sAdd).toHaveBeenCalledWith(key, user.user_id);
  });
});

import ProductCachingService, { productKey } from '../product.service';
import { REDIS_CLIENT } from '@share/di-token';
import startUp from './pre-setup';
import RedisClient from '@share/libs/redis-client/redis';
import { product } from '@share/test/pre-setup/mock/data/product';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';

let productCachingService: ProductCachingService;
let redisClient: RedisClient;
const result = 1;

beforeEach(async () => {
  const moduleRef = await startUp();
  productCachingService = moduleRef.get(ProductCachingService);
  redisClient = moduleRef.get(REDIS_CLIENT);
});

describe('remove all visitors of product', () => {
  it('remove all visitors of product success', async () => {
    expect.hasAssertions();
    const key = productKey(product.product_id as string);
    const del = jest.spyOn(redisClient.Client, 'del').mockResolvedValue(result);
    await expect(productCachingService.removeAllVisitorOfProduct(product.product_id as string)).resolves.toBe(result);
    expect(del).toHaveBeenCalledTimes(1);
    expect(del).toHaveBeenCalledWith(key);
  });

  it('remove visitor failed with unknown error', async () => {
    expect.hasAssertions();
    const key = productKey(product.product_id as string);
    const del = jest.spyOn(redisClient.Client, 'del').mockRejectedValue(UnknownError);
    await expect(productCachingService.removeAllVisitorOfProduct(product.product_id as string)).rejects.toThrow(
      UnknownError,
    );
    expect(del).toHaveBeenCalledTimes(1);
    expect(del).toHaveBeenCalledWith(key);
  });
});

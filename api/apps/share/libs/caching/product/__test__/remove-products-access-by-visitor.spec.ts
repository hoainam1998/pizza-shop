import ProductCachingService, { userProductKey } from '../product.service';
import { REDIS_CLIENT } from '@share/di-token';
import startUp from './pre-setup';
import RedisClient from '@share/libs/redis-client/redis';
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

describe('remove products access by visitor', () => {
  it('remove product access by visitor success', async () => {
    expect.hasAssertions();
    const key = userProductKey(user.user_id);
    const del = jest.spyOn(redisClient.Client, 'del').mockResolvedValue(result);
    await expect(productCachingService.removeProductsAccessByVisitor(user.user_id)).resolves.toBe(result);
    expect(del).toHaveBeenCalledTimes(1);
    expect(del).toHaveBeenCalledWith(key);
  });

  it('remove products access by visitor failed with unknown error', async () => {
    expect.hasAssertions();
    const key = userProductKey(user.user_id);
    const del = jest.spyOn(redisClient.Client, 'del').mockRejectedValue(UnknownError);
    await expect(productCachingService.removeProductsAccessByVisitor(user.user_id)).rejects.toThrow(UnknownError);
    expect(del).toHaveBeenCalledTimes(1);
    expect(del).toHaveBeenCalledWith(key);
  });
});

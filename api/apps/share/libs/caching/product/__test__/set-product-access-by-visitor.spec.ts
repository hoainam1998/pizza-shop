import ProductCachingService, { userProductKey } from '../product.service';
import { REDIS_CLIENT } from '@share/di-token';
import startUp from './pre-setup';
import RedisClient from '@share/libs/redis-client/redis';
import { user } from '@share/test/pre-setup/mock/data/user';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';

let productCachingService: ProductCachingService;
let redisClient: RedisClient;
const result = 1;
const productIds = [Date.now().toString(), (Date.now() + 1).toString()];

beforeEach(async () => {
  const moduleRef = await startUp();
  productCachingService = moduleRef.get(ProductCachingService);
  redisClient = moduleRef.get(REDIS_CLIENT);
});

describe('set product access by visitor', () => {
  it('set product access by visitor success', async () => {
    expect.hasAssertions();
    const key = userProductKey(user.user_id);
    const sAdd = jest.spyOn(redisClient.Client, 'sAdd').mockResolvedValue(result);
    await expect(productCachingService.setProductsAccessByVisitor(productIds, user.user_id)).resolves.toBe(result);
    expect(sAdd).toHaveBeenCalledTimes(1);
    expect(sAdd).toHaveBeenCalledWith(key, productIds);
  });

  it('set product access by visitor failed with unknown error', async () => {
    expect.hasAssertions();
    const key = userProductKey(user.user_id);
    const sAdd = jest.spyOn(redisClient.Client, 'sAdd').mockRejectedValue(UnknownError);
    await expect(productCachingService.setProductsAccessByVisitor(productIds, user.user_id)).rejects.toThrow(
      UnknownError,
    );
    expect(sAdd).toHaveBeenCalledTimes(1);
    expect(sAdd).toHaveBeenCalledWith(key, productIds);
  });
});

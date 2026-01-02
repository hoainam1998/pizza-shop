import ProductCachingService, { userProductKey } from '../product.service';
import { REDIS_CLIENT } from '@share/di-token';
import startUp from './pre-setup';
import RedisClient from '@share/libs/redis-client/redis';
import { user } from '@share/test/pre-setup/mock/data/user';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';

let productCachingService: ProductCachingService;
let redisClient: RedisClient;
const productIds = [Date.now().toString(), (Date.now() + 1).toString()];

beforeEach(async () => {
  const moduleRef = await startUp();
  productCachingService = moduleRef.get(ProductCachingService);
  redisClient = moduleRef.get(REDIS_CLIENT);
});

describe('get product access by visitor', () => {
  it('get product access by visitor success', async () => {
    expect.hasAssertions();
    const key = userProductKey(user.user_id);
    const sMembers = jest.spyOn(redisClient.Client, 'sMembers').mockResolvedValue(productIds);
    await expect(productCachingService.getProductsAccessByVisitor(user.user_id)).resolves.toBe(productIds);
    expect(sMembers).toHaveBeenCalledTimes(1);
    expect(sMembers).toHaveBeenCalledWith(key);
  });

  it('get product access by visitor failed with unknown error', async () => {
    expect.hasAssertions();
    const key = userProductKey(user.user_id);
    const sMembers = jest.spyOn(redisClient.Client, 'sMembers').mockRejectedValue(UnknownError);
    await expect(productCachingService.getProductsAccessByVisitor(user.user_id)).rejects.toThrow(UnknownError);
    expect(sMembers).toHaveBeenCalledTimes(1);
    expect(sMembers).toHaveBeenCalledWith(key);
  });
});

import { Logger } from '@nestjs/common';
import { REDIS_CLIENT } from '@share/di-token';
import startUp from './pre-setup';
import RedisClient from '@share/libs/redis-client/redis';
import UserCachingService from '../user.service';
import { REDIS_SUBSCRIBE_NAME } from '@share/enums';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';

let userCachingService: UserCachingService;
let redisClient: RedisClient;
let close: () => Promise<void>;

beforeAll(async () => {
  const moduleRef = await startUp();
  userCachingService = moduleRef.get(UserCachingService);
  redisClient = moduleRef.get(REDIS_CLIENT);
  close = () => moduleRef.close();
});

afterAll(async () => {
  await close();
});

const func = jest.fn();

describe('logout subscribe', () => {
  it('logout subscribe success', async () => {
    expect.hasAssertions();
    const subscriber = {
      connect: jest.fn().mockResolvedValue({}),
      subscribe: jest.fn().mockResolvedValue({}),
    };
    const configSet = jest.spyOn(redisClient.Client, 'configSet').mockImplementation(jest.fn());
    jest.spyOn(redisClient.Client, 'duplicate').mockReturnValue(subscriber as any);
    const subscribe = jest.spyOn(redisClient, 'subscribe');
    const logoutSubscribe = jest.spyOn(userCachingService, 'logoutSubscribe');
    userCachingService.logoutSubscribe(func);
    expect(logoutSubscribe).toHaveBeenCalledTimes(1);
    expect(configSet).toHaveBeenCalledTimes(1);
    expect(configSet).toHaveBeenCalledWith('notify-keyspace-events', 'Ex');
    expect(subscribe).toHaveBeenCalledTimes(1);
    expect(subscribe).toHaveBeenCalledWith(REDIS_SUBSCRIBE_NAME.KEY_EVENT_EXPIRED, func);
    expect(subscriber.connect).toHaveBeenCalledTimes(1);
    await subscriber.connect.mock.results[0].value[0];
    expect(subscriber.subscribe).toHaveBeenCalledTimes(1);
  });

  it('logout subscribe failed with unknown error', async () => {
    expect.hasAssertions();
    const subscriber = {
      connect: jest.fn().mockResolvedValue({}),
      subscribe: jest.fn().mockRejectedValue(UnknownError),
    };
    const configSet = jest.spyOn(redisClient.Client, 'configSet').mockImplementation(jest.fn());
    jest.spyOn(redisClient.Client, 'duplicate').mockReturnValue(subscriber as any);
    const error = jest.spyOn(Logger, 'error').mockImplementation(jest.fn());
    const subscribe = jest.spyOn(redisClient, 'subscribe');
    const logoutSubscribe = jest.spyOn(userCachingService, 'logoutSubscribe');
    userCachingService.logoutSubscribe(func);
    expect(logoutSubscribe).toHaveBeenCalledTimes(1);
    expect(configSet).toHaveBeenCalledTimes(1);
    expect(configSet).toHaveBeenCalledWith('notify-keyspace-events', 'Ex');
    expect(subscribe).toHaveBeenCalledTimes(1);
    expect(subscribe).toHaveBeenCalledWith(REDIS_SUBSCRIBE_NAME.KEY_EVENT_EXPIRED, func);
    expect(subscriber.connect).toHaveBeenCalledTimes(1);
    await subscriber.connect.mock.results[0].value[0];
    expect(subscriber.subscribe).toHaveBeenCalledTimes(1);
    await subscriber.subscribe.mock.results[0].value[0];
    expect(error).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledWith(expect.any(String), UnknownError.message);
  });
});

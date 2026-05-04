import { Logger } from '@nestjs/common';
import { REDIS_CLIENT } from '@share/di-token';
import startUp from './pre-setup';
import RedisClient from '@share/libs/redis-client/redis';
import UserCachingService from '../user.service';
import { REDIS_SUBSCRIBE_NAME } from '@share/enums';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import Event from '@share/libs/redis-client/events/event';
import { user } from '@share/test/pre-setup/mock/data/user';

let userCachingService: UserCachingService;
let redisClient: RedisClient;
const userId = user.user_id;
const event = Event.createEvent(REDIS_SUBSCRIBE_NAME.LOGOUT, {}, userId);

beforeAll(async () => {
  const moduleRef = await startUp();
  userCachingService = moduleRef.get(UserCachingService);
  redisClient = moduleRef.get(REDIS_CLIENT);
});

describe('logout publish', () => {
  it('logout publish success', () => {
    expect.hasAssertions();
    const publish = jest.spyOn(redisClient, 'publish');
    const publishRedis = jest.spyOn(redisClient.Client, 'publish');
    const logoutPublish = jest.spyOn(userCachingService, 'logoutPublish');
    userCachingService.logoutPublish(userId);
    expect(logoutPublish).toHaveBeenCalledTimes(1);
    expect(publish).toHaveBeenCalledTimes(1);
    expect(publish).toHaveBeenCalledWith(event);
    expect(publishRedis).toHaveBeenCalledTimes(1);
    expect(publishRedis).toHaveBeenCalledWith(event.eventName, event.plainToObject);
  });

  it('logout publish failed with unknown error', async () => {
    expect.hasAssertions();
    const error = jest.spyOn(Logger, 'error').mockImplementation(jest.fn());
    const publish = jest.spyOn(redisClient, 'publish');
    const publishRedis = jest.spyOn(redisClient.Client, 'publish').mockRejectedValue(UnknownError);
    const logoutPublish = jest.spyOn(userCachingService, 'logoutPublish');
    userCachingService.logoutPublish(userId);
    expect(logoutPublish).toHaveBeenCalledTimes(1);
    expect(publish).toHaveBeenCalledTimes(1);
    expect(publish).toHaveBeenCalledWith(event);
    expect(publishRedis).toHaveBeenCalledTimes(1);
    expect(publishRedis).toHaveBeenCalledWith(event.eventName, event.plainToObject);
    await publishRedis.mock.results[0].value[0];
    expect(error).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledWith(expect.any(String), UnknownError.message);
  });
});

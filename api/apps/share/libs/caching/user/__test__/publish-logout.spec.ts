import { Logger } from '@nestjs/common';
import { REDIS_CLIENT } from '@share/di-token';
import startUp from './pre-setup';
import RedisClient from '@share/libs/redis-client/redis';
import Event from '@share/libs/redis-client/events/event';
import { user } from '@share/test/pre-setup/mock/data/user';
import UserCachingService from '../user.service';
import { REDIS_SUBSCRIBE_NAME } from '@share/enums';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';

let userCachingService: UserCachingService;
let redisClient: RedisClient;
let close: () => Promise<void>;
const userId = user.user_id;

beforeAll(async () => {
  const moduleRef = await startUp();
  userCachingService = moduleRef.get(UserCachingService);
  redisClient = moduleRef.get(REDIS_CLIENT);
  close = () => moduleRef.close();
});

afterAll(async () => {
  await close();
});

describe('publish logout', () => {
  it('publish logout success', () => {
    expect.hasAssertions();
    const createEvent = jest.spyOn(Event, 'createEvent');
    const errorLog = jest.spyOn(Logger, 'error').mockImplementation(jest.fn());
    const redisClientPublish = jest.spyOn(redisClient.Client, 'publish');
    const publish = jest.spyOn(redisClient, 'publish');
    const publishLogout = jest.spyOn(userCachingService, 'publishLogout');
    userCachingService.publishLogout(userId);
    const event = createEvent.mock.results[0].value;
    expect(publishLogout).toHaveBeenCalledTimes(1);
    expect(createEvent).toHaveBeenCalledTimes(1);
    expect(createEvent).toHaveBeenCalledWith(REDIS_SUBSCRIBE_NAME.LOGOUT, { userId }, userId);
    expect(publish).toHaveBeenCalledTimes(1);
    expect(publish).toHaveBeenCalledWith(event);
    expect(redisClientPublish).toHaveBeenCalledTimes(1);
    expect(redisClientPublish).toHaveBeenCalledWith(event.eventName, event.plainToObject);
    expect(errorLog).not.toHaveBeenCalled();
  });

  it('publish logout failed with unknown error', async () => {
    expect.hasAssertions();
    const createEvent = jest.spyOn(Event, 'createEvent');
    const errorLog = jest.spyOn(Logger, 'error').mockImplementation(jest.fn());
    const redisClientPublish = jest.spyOn(redisClient.Client, 'publish').mockRejectedValue(UnknownError);
    const publish = jest.spyOn(redisClient, 'publish');
    const publishLogout = jest.spyOn(userCachingService, 'publishLogout');
    userCachingService.publishLogout(userId);
    const event = createEvent.mock.results[0].value;
    expect(publishLogout).toHaveBeenCalledTimes(1);
    expect(createEvent).toHaveBeenCalledTimes(1);
    expect(createEvent).toHaveBeenCalledWith(REDIS_SUBSCRIBE_NAME.LOGOUT, { userId }, userId);
    expect(publish).toHaveBeenCalledTimes(1);
    expect(publish).toHaveBeenCalledWith(event);
    expect(redisClientPublish).toHaveBeenCalledTimes(1);
    expect(redisClientPublish).toHaveBeenCalledWith(event.eventName, event.plainToObject);
    await redisClientPublish.mock.results[0].value[0];
    expect(errorLog).toHaveBeenCalledTimes(1);
    expect(errorLog).toHaveBeenCalledWith(expect.any(String), UnknownError.message);
  });
});

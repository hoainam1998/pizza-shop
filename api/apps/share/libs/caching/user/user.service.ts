import { Injectable } from '@nestjs/common';
import CachingService from '../caching';
import { getRedisSessionId } from '@share/utils';
import constants from '@share/constants';
import { REDIS_SUBSCRIBE_NAME } from '@share/enums';
import Event from '@share/libs/redis-client/events/event';
const REDIS_PREFIX_USER = constants.REDIS_PREFIX.USER;

@Injectable()
export default class UserCachingService extends CachingService {
  checkExists(sessionId: string): Promise<boolean> {
    return this.exists(getRedisSessionId(sessionId));
  }

  checkUserAlreadyLogged(sessionId: string): Promise<string | null> {
    return this.RedisClientInstance.get(getRedisSessionId(sessionId));
  }

  getUserApiKey(userId: string): Promise<string | null> {
    return this.RedisClientInstance.hGet(REDIS_PREFIX_USER, userId);
  }

  logoutSubscribe(logout: (args: any) => void): void {
    void this.RedisInstance.subscribe(REDIS_SUBSCRIBE_NAME.LOGOUT, logout);
  }

  logoutPublish(userId: string): void {
    const event = Event.createEvent(REDIS_SUBSCRIBE_NAME.LOGOUT, {}, userId);
    this.RedisInstance.publish(event);
  }
}

import { Injectable } from '@nestjs/common';
import CachingService from '../caching';
import { getRedisSessionId } from '@share/utils';

@Injectable()
export default class UserCachingService extends CachingService {
  checkExists(sessionId: string): Promise<boolean> {
    return this.exists(getRedisSessionId(sessionId));
  }

  checkUserAlreadyLogged(sessionId: string): Promise<string | null> {
    return this.RedisClientInstance.get(getRedisSessionId(sessionId));
  }
}

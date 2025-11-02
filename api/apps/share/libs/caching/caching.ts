import { Inject } from '@nestjs/common';
import { REDIS_CLIENT } from '@share/di-token';
import RedisClient from '@share/libs/redis-client/redis';

export default abstract class {
  constructor(@Inject(REDIS_CLIENT) private readonly redisClient: RedisClient) {}

  protected get RedisClientInstance() {
    return this.redisClient.Client;
  }

  protected exists(key: string) {
    return this.RedisClientInstance.exists(key).then((result) => result > 0);
  }

  protected jsonSet(key: string, data: any[]): Promise<'OK' | null> {
    return this.RedisClientInstance.json.set(key, '$', data);
  }

  protected jsonGet<T>(key: string): Promise<T[]> {
    return this.RedisClientInstance.json.get(key, { path: '$' }).then((results: any) => results[0]);
  }

  abstract checkExists(): Promise<boolean>;
}

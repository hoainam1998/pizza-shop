import { PrismaClient } from 'generated/prisma';
import RedisClient from '@share/libs/redis-client/redis';

/**
 * Store all user api key for route guard validate.
 * @param {RedisClient} redisClient - The Redis client instance.
 * @param {PrismaClient} prismaClient - The Prisma client instance.
 */
export default (redisClient: RedisClient, prismaClient: PrismaClient) => {
  void prismaClient.user
    .findMany({
      select: {
        user_id: true,
        api_key: true,
      },
    })
    .then((users) => {
      const userApiKeys = users.reduce<Record<string, string>>((groups, user) => {
        groups[user.user_id] = user.api_key!;
        return groups;
      }, {});
      void redisClient.Client.hSet('user', userApiKeys);
    });
};

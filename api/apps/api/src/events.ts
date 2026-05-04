import { PrismaClient } from 'generated/prisma';
import RedisClient from '@share/libs/redis-client/redis';
import constants from '@share/constants';

/**
 * Store all user api key for route guard validate.
 * @param {RedisClient} redisClient - The Redis client instance.
 * @param {PrismaClient} prismaClient - The Prisma client instance.
 */
const startUp = (redisClient: RedisClient, prismaClient: PrismaClient): void => {
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
      void redisClient.Client.del(constants.REDIS_PREFIX.USER);
      void redisClient.Client.hSet(constants.REDIS_PREFIX.USER, userApiKeys);
    });
};

/**
 * Remove all application information.
 * @param {RedisClient} redisClient - The Redis client instance.
 * @param {PrismaClient} prismaClient - The Prisma client instance.
 */
const shutDown = async (redisClient: RedisClient, prismaClient: PrismaClient): Promise<void> => {
  await redisClient.Client.flushDb();
  await prismaClient.user.updateMany({
    data: {
      session_id: null,
    },
  });
};

export { startUp, shutDown };

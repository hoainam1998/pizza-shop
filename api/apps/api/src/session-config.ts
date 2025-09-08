import session from 'express-session';
import { RedisStore } from 'connect-redis';
import constants from '@share/constants';
import { RedisClientType } from 'redis';

export default (redisClient: RedisClientType) =>
  ({
    store: new RedisStore({
      client: redisClient,
      prefix: constants.REDIS_PREFIX,
    }),
    secret: process.env.SESSION_ID_TOKEN!,
    resave: false,
    saveUninitialized: false,
  }) satisfies session.SessionOptions;

import session from 'express-session';
import { RedisStore } from 'connect-redis';
import constants from '@share/constants';
import { RedisClientType } from 'redis';

export default (redisClient: RedisClientType) =>
  ({
    store: new RedisStore({
      client: redisClient,
      prefix: constants.REDIS_PREFIX.SESSION_KEY,
    }),
    secret: process.env.SESSION_ID_TOKEN!,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: +process.env.SESSION_EXPIRES! },
  }) satisfies session.SessionOptions;

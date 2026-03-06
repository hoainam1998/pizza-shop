import { registerAs } from '@nestjs/config';

export const databaseConfig = registerAs('database', () => ({
  HOST: process.env.DATABASE_HOST,
  DATABASE_URL: process.env.DATABASE_URL,
}));

export const portConfig = registerAs('ports', () => ({
  API_PORT: process.env.API_PORT,
  USER_MICROSERVICE_TCP_PORT: process.env.USER_MICROSERVICE_TCP_PORT,
  CATEGORY_MICROSERVICE_TCP_PORT: process.env.CATEGORY_MICROSERVICE_TCP_PORT,
  INGREDIENT_MICROSERVICE_TCP_PORT: process.env.INGREDIENT_MICROSERVICE_TCP_PORT,
  PRODUCT_MICROSERVICE_TCP_PORT: process.env.PRODUCT_MICROSERVICE_TCP_PORT,
  SOCKET_MICROSERVICE_TCP_PORT: process.env.SOCKET_MICROSERVICE_TCP_PORT,
  SOCKET_PORT: process.env.SOCKET_PORT,
}));

export const emailConfig = registerAs('mail', () => ({
  SMPT_HOST: process.env.SMPT_HOST,
  SMPT_PORT: process.env.SMPT_PORT,
  SMPT_MAIL: process.env.SMPT_MAIL,
  SMPT_APP_PASS: process.env.SMPT_APP_PASS,
}));

export const throttleConfig = registerAs('throttle', () => ({
  THROTTLE_TTL: process.env.THROTTLE_TTL,
  THROTTLE_LIMIT: process.env.THROTTLE_LIMIT,
}));

export const sessionConfig = registerAs('session', () => ({
  SESSION_EXPIRES: process.env.SESSION_EXPIRES,
}));

export const socketConfig = registerAs('socket', () => ({
  SOCKET_PING_INTERVAL: process.env.SOCKET_PING_INTERVAL,
  SOCKET_PING_TIMEOUT: process.env.SOCKET_PING_TIMEOUT,
}));

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
}));

export const emailConfig = registerAs('mail', () => ({
  SMPT_HOST: process.env.SMPT_HOST,
  SMPT_PORT: process.env.SMPT_PORT,
  SMPT_MAIL: process.env.SMPT_MAIL,
  SMPT_APP_PASS: process.env.SMPT_APP_PASS,
}));

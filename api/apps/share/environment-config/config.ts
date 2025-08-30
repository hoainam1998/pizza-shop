import { registerAs } from '@nestjs/config';

export const databaseConfig = registerAs('database', () => ({
  HOST: process.env.DATABASE_HOST,
  DATABASE_URL: process.env.DATABASE_URL,
}));

export const portConfig = registerAs('ports', () => ({
  API_PORT: process.env.API_PORT,
}));

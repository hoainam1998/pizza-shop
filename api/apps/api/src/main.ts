import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from 'generated/prisma';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import helmet from 'helmet';
import AppModule from './app.module';
import { HttpExceptionFilter } from '@share/exception-filter';
import corsConfig from './cors-config';
import startUp from './start-up';
import sessionConfig from '@share/session-config';
import { PRISMA_CLIENT, REDIS_CLIENT } from '@share/di-token';
import RedisClient from '@share/libs/redis-client/redis';
import { GlobalValidatePipe } from '@share/pipes';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: corsConfig });
  const redisClient: RedisClient = app.get(REDIS_CLIENT);
  const config: ConfigService = app.get(ConfigService);
  const prismaClient: PrismaClient = app.get(PRISMA_CLIENT);
  const port = config.get<number | string>('ports.API_PORT') || 5000;
  app.use(helmet());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(GlobalValidatePipe.getInstance());
  app.use(session(sessionConfig(redisClient.Client)));
  app.use(cookieParser());
  startUp(redisClient, prismaClient);
  await app.listen(port, () => Logger.log(`App started at ${port}`, 'App Bootstrap'));
}
bootstrap();

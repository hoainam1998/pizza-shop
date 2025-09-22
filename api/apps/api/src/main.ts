import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { BadRequestException, Logger, ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { ConfigService } from '@nestjs/config';
import session from 'express-session';
import AppModule from './app.module';
import { HttpExceptionFilter, PrismaDisconnectExceptionFilter } from '@share/exception-filter';
import corsConfig from './cors-config';
import sessionConfig from './session-config';
import { REDIS_CLIENT } from '@share/di-token';
import RedisClient from '@share/libs/redis-client/redis';
import { type ValidationCustomErrorType } from '@share/interfaces';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: corsConfig });
  const redisClient: RedisClient = app.get(REDIS_CLIENT);
  const config: ConfigService = app.get(ConfigService);
  const port = config.get<number | string>('ports.API_PORT') || 5000;
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (exceptions: ValidationError[]) => {
        const error = exceptions.reduce(
          (errorObject: ValidationCustomErrorType, exception: ValidationError) => {
            errorObject.messages.push(Object.values(exception.constraints!));
            errorObject.messages = errorObject.messages.flat();
            return errorObject;
          },
          { messages: [] },
        );

        throw new BadRequestException(error);
      },
    }),
  );
  app.useGlobalFilters(new PrismaDisconnectExceptionFilter(), new HttpExceptionFilter());
  app.use(session(sessionConfig(redisClient.Client)));
  await app.listen(port, () => Logger.log(`App started at ${port}`, 'App Bootstrap'));
}
bootstrap();

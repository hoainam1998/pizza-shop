import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { BadRequestException, Logger, ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { ConfigService } from '@nestjs/config';
import session from 'express-session';
import AppModule from './app.module';
import { HttpExceptionFilter } from '@share/exception-filter';
import corsConfig from './cors-config';
import sessionConfig from './session-config';
import { REDIS_CLIENT } from '@share/di-token';
import RedisClient from '@share/libs/redis-client/redis';

const handleValidateException = (exceptions: ValidationError[]) => {
  return exceptions.reduce((messages: string[], exception: ValidationError) => {
    if (exception.constraints) {
      messages = messages.concat(Object.values(exception.constraints));
    }

    if (exception.children) {
      const messagesChild = handleValidateException(exception.children || []);
      messages = messages.concat(messagesChild);
    }

    return messages;
  }, []);
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: corsConfig });
  const redisClient: RedisClient = app.get(REDIS_CLIENT);
  const config: ConfigService = app.get(ConfigService);
  const port = config.get<number | string>('ports.API_PORT') || 5000;
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (exceptions: ValidationError[]) => {
        const errors = handleValidateException(exceptions);
        throw new BadRequestException({ messages: errors });
      },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.use(session(sessionConfig(redisClient.Client)));
  await app.listen(port, () => Logger.log(`App started at ${port}`, 'App Bootstrap'));
}
bootstrap();

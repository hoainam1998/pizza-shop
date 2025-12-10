import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import session from 'express-session';
import { APP_GUARD } from '@nestjs/core';
import { ClientProxy } from '@nestjs/microservices';
import CategoryModule from '../category.module';
import { CATEGORY_SERVICE, REDIS_CLIENT } from '@share/di-token';
import { App } from 'supertest/types';
import sessionConfig from '@share/session-config';
import { HttpExceptionFilter } from '@share/exception-filter';
import { GlobalValidatePipe } from '@share/pipes';
import RedisClient from '@share/libs/redis-client/redis';
import AuthGuard from '@share/guards/auth.service';
import { redisClient as redisClientProvider } from '@share/providers';

const startUp = async (module = CategoryModule) => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [module],
    providers: [
      {
        provide: APP_GUARD,
        useClass: AuthGuard,
      },
      redisClientProvider,
    ],
  })
    .overrideProvider(CATEGORY_SERVICE)
    .useValue({
      send: jest.fn(),
    })
    .compile();

  const app = moduleFixture.createNestApplication();
  const redisClient: RedisClient = app.get(REDIS_CLIENT);
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(GlobalValidatePipe.getInstance());
  app.use(session(sessionConfig(redisClient.Client)));
  await app.listen(0);
  const clientProxy = app.get<ClientProxy>(CATEGORY_SERVICE);

  return {
    clientProxy,
    api: request(app.getHttpServer() as App),
    app,
  };
};

export default startUp;

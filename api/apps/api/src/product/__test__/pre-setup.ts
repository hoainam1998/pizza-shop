import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import session from 'express-session';
import { APP_GUARD } from '@nestjs/core';
import { ClientProxy } from '@nestjs/microservices';
import ProductModule from '../product.module';
import { PRODUCT_SERVICE, REDIS_CLIENT } from '@share/di-token';
import { App } from 'supertest/types';
import { HttpExceptionFilter } from '@share/exception-filter';
import { GlobalValidatePipe } from '@share/pipes';
import sessionConfig from '@share/session-config';
import RedisClient from '@share/libs/redis-client/redis';
import AuthGuard from '@share/guards/auth.service';

const startUp = async (module = ProductModule) => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [module],
    providers: [
      {
        provide: APP_GUARD,
        useClass: AuthGuard,
      },
    ],
  })
    .overrideProvider(PRODUCT_SERVICE)
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
  const clientProxy = app.get<ClientProxy>(PRODUCT_SERVICE);

  return {
    clientProxy,
    api: request(app.getHttpServer() as App),
    app,
  };
};

export default startUp;

import { Test, TestingModule } from '@nestjs/testing';
import { APP_GUARD } from '@nestjs/core';
import { App } from 'supertest/types';
import request from 'supertest';
import session from 'express-session';
import { ClientProxy } from '@nestjs/microservices';
import sessionConfig from '@share/session-config';
import IngredientModule from '../ingredient.module';
import { INGREDIENT_SERVICE, REDIS_CLIENT } from '@share/di-token';
import { HttpExceptionFilter } from '@share/exception-filter';
import { GlobalValidatePipe } from '@share/pipes';
import AuthGuard from '@share/guards/auth.service';
import RedisClient from '@share/libs/redis-client/redis';

const startUp = async (module = IngredientModule) => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [module],
    providers: [
      {
        provide: APP_GUARD,
        useClass: AuthGuard,
      },
    ],
  })
    .overrideProvider(INGREDIENT_SERVICE)
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
  const clientProxy = app.get<ClientProxy>(INGREDIENT_SERVICE);

  return {
    clientProxy,
    api: request(app.getHttpServer() as App),
    app,
  };
};

export default startUp;

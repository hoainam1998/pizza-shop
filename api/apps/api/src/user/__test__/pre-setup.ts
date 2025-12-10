import { Test, TestingModule } from '@nestjs/testing';
import session from 'express-session';
import request from 'supertest';
import { ClientProxy } from '@nestjs/microservices';
import UserModule from '../user.module';
import { USER_SERVICE, REDIS_CLIENT } from '@share/di-token';
import { App } from 'supertest/types';
import RedisClient from '@share/libs/redis-client/redis';
import { HttpExceptionFilter } from '@share/exception-filter';
import { GlobalValidatePipe } from '@share/pipes';
import sessionConfig from '@share/session-config';

const startUp = async (module = UserModule) => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [module],
  })
    .overrideProvider(USER_SERVICE)
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
  const clientProxy = app.get<ClientProxy>(USER_SERVICE);

  return {
    clientProxy,
    api: request(app.getHttpServer() as App),
    app,
  };
};

export default startUp;

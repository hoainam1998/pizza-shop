import { Test, TestingModule } from '@nestjs/testing';
import { App } from 'supertest/types';
import request from 'supertest';
import { ClientProxy } from '@nestjs/microservices';
import IngredientModule from '../ingredient.module';
import { INGREDIENT_SERVICE } from '@share/di-token';
import { HttpExceptionFilter } from '@share/exception-filter';

const startUp = async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [IngredientModule],
  })
    .overrideProvider(INGREDIENT_SERVICE)
    .useValue({
      send: jest.fn(),
    })
    .compile();

  const app = moduleFixture.createNestApplication();
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(0);
  const clientProxy = app.get<ClientProxy>(INGREDIENT_SERVICE);

  return {
    clientProxy,
    api: request(app.getHttpServer() as App),
    app,
  };
};

export default startUp;

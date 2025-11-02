import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { ClientProxy } from '@nestjs/microservices';
import ProductModule from '../product.module';
import { PRODUCT_SERVICE } from '@share/di-token';
import { App } from 'supertest/types';
import { HttpExceptionFilter } from '@share/exception-filter';
import { GlobalValidatePipe } from '@share/pipes';

const startUp = async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [ProductModule],
  })
    .overrideProvider(PRODUCT_SERVICE)
    .useValue({
      send: jest.fn(),
    })
    .compile();

  const app = moduleFixture.createNestApplication();
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(GlobalValidatePipe.getInstance());
  await app.listen(0);
  const clientProxy = app.get<ClientProxy>(PRODUCT_SERVICE);

  return {
    clientProxy,
    api: request(app.getHttpServer() as App),
    app,
  };
};

export default startUp;

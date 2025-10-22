import { Test, TestingModule } from '@nestjs/testing';
import IngredientController from '../ingredient.controller';
import IngredientService from '../ingredient.service';
import ShareTestingModule from '@share/test/module';
import ShareModule from '@share/module';
import LoggingModule from '@share/libs/logging/logging.module';

export default (): Promise<TestingModule> => {
  return Test.createTestingModule({
    imports: [ShareModule, LoggingModule],
    controllers: [IngredientController],
    providers: [IngredientService],
  })
    .overrideModule(ShareModule)
    .useModule(ShareTestingModule)
    .compile();
};

afterEach((done) => {
  jest.restoreAllMocks();
  jest.resetAllMocks();
  done();
});

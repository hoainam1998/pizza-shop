import { Test, TestingModule } from '@nestjs/testing';
import CategoryController from '../category.controller';
import CategoryService from '../category.service';
import ShareTestingModule from '@share/test/module';
import ShareModule from '@share/module';
import LoggingModule from '@share/libs/logging/logging.module';

export default (): Promise<TestingModule> => {
  return Test.createTestingModule({
    imports: [ShareModule, LoggingModule],
    controllers: [CategoryController],
    providers: [CategoryService],
  })
    .overrideModule(ShareModule)
    .useModule(ShareTestingModule)
    .compile();
};

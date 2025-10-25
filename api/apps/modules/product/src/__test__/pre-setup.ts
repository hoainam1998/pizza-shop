import { Test, TestingModule } from '@nestjs/testing';
import ProductController from '../product.controller';
import ProductService from '../product.service';
import ShareTestingModule from '@share/test/module';
import ShareModule from '@share/module';
import LoggingModule from '@share/libs/logging/logging.module';

export default (): Promise<TestingModule> => {
  return Test.createTestingModule({
    imports: [ShareModule, LoggingModule],
    controllers: [ProductController],
    providers: [ProductService],
  })
    .overrideModule(ShareModule)
    .useModule(ShareTestingModule)
    .compile();
};

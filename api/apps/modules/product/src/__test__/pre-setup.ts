import { Test, TestingModule } from '@nestjs/testing';
import ProductController from '../product.controller';
import ProductService from '../product.service';
import ShareTestingModule from '@share/test/module';
import ShareModule from '@share/module';
import LoggingModule from '@share/libs/logging/logging.module';
import { ScheduleModule } from '@nestjs/schedule';

export default (): Promise<TestingModule> => {
  return Test.createTestingModule({
    imports: [ShareModule, LoggingModule, ScheduleModule.forRoot()],
    controllers: [ProductController],
    providers: [ProductService],
  })
    .overrideModule(ShareModule)
    .useModule(ShareTestingModule)
    .compile();
};

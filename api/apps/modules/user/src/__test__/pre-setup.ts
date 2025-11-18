import { Test, TestingModule } from '@nestjs/testing';
import UserController from '../user.controller';
import UserService from '../user.service';
import ShareTestingModule from '@share/test/module';
import ShareModule from '@share/module';
import LoggingModule from '@share/libs/logging/logging.module';

export default (): Promise<TestingModule> => {
  return Test.createTestingModule({
    imports: [ShareModule, LoggingModule],
    controllers: [UserController],
    providers: [UserService],
  })
    .overrideModule(ShareModule)
    .useModule(ShareTestingModule)
    .compile();
};

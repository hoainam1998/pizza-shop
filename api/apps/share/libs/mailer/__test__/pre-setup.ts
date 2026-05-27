import { Test, TestingModule } from '@nestjs/testing';
import SendEmailModule from '../mailer.module';
import { MailerService } from '@nestjs-modules/mailer';
import ShareModule from '@share/module';

export default (): Promise<TestingModule> => {
  return Test.createTestingModule({
    imports: [SendEmailModule, ShareModule],
  })
    .overrideProvider(MailerService)
    .useValue({
      sendMail: jest.fn(),
    })
    .compile();
};

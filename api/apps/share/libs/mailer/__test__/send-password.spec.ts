import { MailerService } from '@nestjs-modules/mailer';
import startUp from './pre-setup';
import SendEmailService from '../mailer.service';
import { user, resetPasswordToken } from '@share/test/pre-setup/mock/data/user';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';

let close: () => Promise<void>;
let mailService: MailerService;
let sendEmailService: SendEmailService;
const mockEmail = 'mockEmail@gmail.com';
const link = resetPasswordToken;
const password = user.password;
const mailOptions = {
  from: expect.any(String),
  to: mockEmail,
  subject: expect.any(String),
  html: expect.any(String),
};

beforeAll(async () => {
  const moduleRef = await startUp();
  mailService = moduleRef.get(MailerService);
  sendEmailService = moduleRef.get(SendEmailService);
  close = () => moduleRef.close();
});

afterAll(async () => {
  await close();
});

describe('send password', () => {
  it('send password success', async () => {
    expect.hasAssertions();
    const sendMail = jest.spyOn(mailService, 'sendMail').mockResolvedValue({});
    const sendEmail = jest.spyOn(sendEmailService as any, '_sendEmail');
    const sendPassword = jest.spyOn(sendEmailService, 'sendPassword');
    await expect(sendEmailService.sendPassword(mockEmail, link, password)).resolves.toEqual({});
    expect(sendPassword).toHaveBeenCalledTimes(1);
    expect(sendEmail).toHaveBeenCalledTimes(1);
    expect(sendEmail).toHaveBeenCalledWith(mockEmail, expect.any(String), expect.any(String));
    expect(sendMail).toHaveBeenCalledTimes(1);
    expect(sendMail).toHaveBeenLastCalledWith(mailOptions);
  });

  it('send password failed', async () => {
    expect.hasAssertions();
    const sendMail = jest.spyOn(mailService, 'sendMail').mockRejectedValue(UnknownError);
    const sendEmail = jest.spyOn(sendEmailService as any, '_sendEmail');
    const sendPassword = jest.spyOn(sendEmailService, 'sendPassword');
    await expect(sendEmailService.sendPassword(mockEmail, link, password)).rejects.toThrow(UnknownError);
    expect(sendPassword).toHaveBeenCalledTimes(1);
    expect(sendEmail).toHaveBeenCalledTimes(1);
    expect(sendEmail).toHaveBeenCalledWith(mockEmail, expect.any(String), expect.any(String));
    expect(sendMail).toHaveBeenCalledTimes(1);
    expect(sendMail).toHaveBeenLastCalledWith(mailOptions);
  });
});

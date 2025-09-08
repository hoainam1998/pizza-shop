import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import SendEmailService from './mailer.service';
import { TransportType } from '@nestjs-modules/mailer/dist/interfaces/mailer-options.interface';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        return {
          transport: {
            host: configService.get<string>('mail.SMPT_HOST'),
            port: configService.get<string>('mail.SMPT_PORT'),
            secure: true,
            auth: {
              user: configService.get<string>('mail.SMPT_MAIL'),
              pass: configService.get<string>('mail.SMPT_APP_PASS'),
            },
            service: 'gmail',
          } as TransportType,
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [SendEmailService],
  exports: [SendEmailService],
})
export default class SendEmailModule {}

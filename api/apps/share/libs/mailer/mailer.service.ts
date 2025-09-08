import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { SentMessageInfo } from 'nodemailer';

@Injectable()
export default class SendEmailService {
  constructor(private readonly mailService: MailerService) {}

  /**
   * Send email util.
   *
   * @param {string} to - The receiver.
   * @param {string} subject - The email subject.
   * @param {string} html - The email content.
   * @return {Promise} - The email sent result.
   */
  private _sendEmail(to: string, subject: string, html: string): Promise<SentMessageInfo> {
    const mailOptions = {
      from: process.env.SMPT_MAIL,
      to: to,
      subject,
      html,
    };

    return this.mailService.sendMail(mailOptions);
  }

  /**
   * Sending email contain new password and reset password link.
   * @param {string} email - The receiver.
   * @param {string} link - The reset password link.
   * @param {string} password - The new password.
   * @return {Promise} - The email sent result.
   */
  sendPassword(email: string, link: string, password: string): Promise<SentMessageInfo> {
    const subject = 'Reset password';
    const html = `
      <div><h3 style="display: inline-block; margin-right: 7px; margin-bottom: 5px">Your password: </h3>${password}</div>
      <h3>Click this link to navigate to reset password page</h3>
      <a href=${link} target="_blank">${link}</a>
    `;
    return this._sendEmail(email, subject, html);
  }
}

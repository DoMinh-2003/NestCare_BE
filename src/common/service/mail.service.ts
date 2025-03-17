import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendWelcomeEmail(to: string, subject: string, text: string) {
    await this.mailerService.sendMail({
      to, // Email người nhận
      subject,
      text
      //   template: './welcome', // File template email (welcome.hbs)
      //   context: { username }, // Truyền biến vào template
      
    });
  }
}

import { Controller, Post, Body } from '@nestjs/common';
import { MailService } from './mail.service';
import { CreateMailDto } from './dto/CreateMailDto';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('send')
  async sendMail(@Body() createMailDto: CreateMailDto): Promise<string> {
    await this.mailService.sendMail(createMailDto);
    return 'Email sent successfully';
  }
}

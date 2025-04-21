import { Controller, Post, Body } from '@nestjs/common';
import { MobileService } from './mobile.service';
import { SendSmsDto } from './dtos/SendSms.dto';

@Controller('mobile')
export class MobileController {
  constructor(private readonly mobileService: MobileService) {}

  @Post('send-otp')
  async sendOtp(@Body() sendSmsDto: SendSmsDto): Promise<{ message: string }> {
    await this.mobileService.sendOtpSms(sendSmsDto.phoneNumber, sendSmsDto.message);
    return { message: 'SMS sent successfully.' };
  }
}

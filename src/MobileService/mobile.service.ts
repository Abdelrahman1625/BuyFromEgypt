import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as twilio from 'twilio';

@Injectable()
export class MobileService {
  private readonly twilioClient: twilio.Twilio;
  private readonly logger = new Logger(MobileService.name);

  constructor(private configService: ConfigService) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID || this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = process.env.TWILIO_AUTH_TOKEN || this.configService.get<string>('TWILIO_AUTH_TOKEN');

    if (!accountSid || !authToken) {
      this.logger.error('Twilio credentials are missing or invalid!');
      throw new Error('Twilio credentials are not properly configured. Please check your environment variables.');
    }

    this.twilioClient = twilio(accountSid, authToken);
  }

  async sendOtpSms(phoneNumber: string, otpCode: string): Promise<void> {
    try {
      const fromNumber = process.env.TWILIO_PHONE_NUMBER;
      const appName = process.env.SITE_NAME || 'Buy From Egypt';

      const message = `${appName}: Your verification code is ${otpCode}. This code will expire in 5 minutes.`;

      await this.twilioClient.messages.create({
        body: message,
        from: fromNumber,
        to: this.formatPhoneNumber(phoneNumber),
      });

      this.logger.log(`SMS with OTP sent successfully to ${phoneNumber}`);
    } catch (error) {
      this.logger.error(`Failed to send OTP SMS to ${phoneNumber}: ${error.message}`);
      throw new Error(`Failed to send SMS: ${error.message}`);
    }
  }

  async sendResetLinkSms(phoneNumber: string, resetLink: string): Promise<void> {
    try {
      const fromNumber = process.env.TWILIO_PHONE_NUMBER;
      const appName = process.env.SITE_NAME || 'Buy From Egypt';

      const message = `${appName}: Click this link to reset your password: ${resetLink}. This link will expire in 5 minutes.`;

      await this.twilioClient.messages.create({
        body: message,
        from: fromNumber,
        to: this.formatPhoneNumber(phoneNumber),
      });

      this.logger.log(`SMS with reset link sent successfully to ${phoneNumber}`);
    } catch (error) {
      this.logger.error(`Failed to send reset link SMS to ${phoneNumber}: ${error.message}`);
      throw new Error(`Failed to send SMS: ${error.message}`);
    }
  }

  async verifyPhoneNumber(phoneNumber: string): Promise<boolean> {
    try {
      const phoneInfo = await this.twilioClient.lookups.phoneNumbers(this.formatPhoneNumber(phoneNumber)).fetch();
      return !!phoneInfo.phoneNumber;
    } catch (error) {
      this.logger.warn(`Invalid phone number ${phoneNumber}: ${error.message}`);
      return false;
    }
  }

  private formatPhoneNumber(phoneNumber: string): string {
    if (!phoneNumber.startsWith('+')) {
      return `+${phoneNumber}`;
    }
    return phoneNumber;
  }
}

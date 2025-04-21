import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { CreateMailDto } from './dto/CreateMailDto';

@Injectable()
export class MailService {
  private transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  async sendOtpEmail(email: string, otpCode: string): Promise<void> {
    const mailOptions = {
      from: `"Buy From Egypt" <${process.env.MAIL_USER}>`,
      to: email,
      subject: 'Password Reset OTP Code',
      html: `
        <h1>Password Reset Request</h1>
        <p>Hello,</p>
        <p>We received a request to reset your password. Please use the following OTP code to continue with your password reset:</p>
        <h2 style="background-color: #f4f4f4; padding: 10px; text-align: center;">${otpCode}</h2>
        <p>This code will expire in 5 minutes.</p>
        <p>If you did not request a password reset, please ignore this email or contact support if you have any concerns.</p>
        <p>Thank you,</p>
        <p>The Team</p>
      `,
    };
    await this.transporter.sendMail(mailOptions);
  }

  async sendResetLink(email: string, resetLink: string): Promise<void> {
    const mailOptions = {
      from: `"Buy From Egypt" <${process.env.MAIL_USER}>`,
      to: email,
      subject: 'Password Reset Link',
      html: `
        <h1>Password Reset Link</h1>
        <p>Hello,</p>
        <p>We have verified your OTP code. Please click the link below to set your new password:</p>
        <p><a href="${resetLink}" style="background-color: #4CAF50; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Reset Your Password</a></p>
        <p>This link will expire in 5 minutes.</p>
        <p>If you did not request a password reset, please ignore this email or contact support if you have any concerns.</p>
        <p>Thank you,</p>
        <p>The Team</p>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }
  async sendMail(createMailDto: CreateMailDto): Promise<void> {
    const { to, subject, text, html } = createMailDto;

    const mailOptions = {
      from: `"Buy From Egypt" <${process.env.MAIL_USER}>`,
      to,
      subject,
      ...(text && { text }),
      ...(html && { html }),
    };

    await this.transporter.sendMail(mailOptions);
  }
}

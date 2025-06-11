import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { RegisterDto } from './dtos/Register.dto';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { LoginDto } from './dtos/Login.dto';
import { JwtService } from '@nestjs/jwt';
import { RequestResetDto } from './dtos/RequestReset.dto';
import { VerifyOtpDto } from './dtos/VerifyOTP.dto';
import { ResetPasswordDto } from './dtos/ResetPassword.dto';
import { MailService } from '../MailService/mail.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService
  ) {}

  async register(registerDto: RegisterDto): Promise<{ user: User; message: string }> {
    // Validate required fields
    const requiredFields = ['name', 'email', 'password', 'phoneNumber', 'type', 'taxId', 'nationalId', 'country', 'age'];
    const missingFields = requiredFields.filter((field) => !registerDto[field]);

    if (missingFields.length > 0) {
      throw new UnauthorizedException(`Missing required fields: ${missingFields.join(', ')}`);
    }

    const existingUser = await this.prisma.user.findFirst({
      where: { OR: [{ email: registerDto.email }, { phoneNumber: registerDto.phoneNumber }, { taxId: registerDto.taxId }] },
      select: { email: true, phoneNumber: true, taxId: true },
    });

    if (existingUser) {
      throw new UnauthorizedException(
        existingUser.email === registerDto.email || existingUser.phoneNumber === registerDto.phoneNumber ? 'Email Or Phone number is already exists' : 'Tax ID is already exists'
      );
    }

    try {
      const hashedPassword: string = await bcrypt.hash(registerDto.password, 10);

      const newUser = await this.prisma.user.create({
        data: {
          ...registerDto,
          password: hashedPassword,
          role: 'USER',
        },
      });

      return {
        message: 'Your account has been successfully created and is currently under review. You will be notified once the verification process is complete.',
        user: newUser,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new UnauthorizedException('Invalid data provided. Please check all required fields and their formats.');
      }
      throw error;
    }
  }

  async login(
    loginDto: LoginDto
  ): Promise<{ user: { userId: string; name: string; email: string; role: string; profileImage: string | null; type: string; active: boolean; emailVerified: boolean }; token: string }> {
    const user = await this.prisma.user.findFirst({
      where: { email: loginDto.email },
      select: {
        userId: true,
        name: true,
        email: true,
        role: true,
        profileImage: true,
        active: true,
        type: true,
        emailVerified: true,
        password: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('The email address is not registered. Please sign up first.');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('The Email Or Password you entered is incorrect. Please try again.');
    }

    if (!user.active) {
      throw new ForbiddenException("Account under review. You'll be notified upon verification.");
    }

    const { userId, name, email, role, profileImage, type, active, emailVerified } = user;
    const payload = { userId: user.userId, email: user.email, active: user.active, role: user.role, type: user.type };
    const token = await this.jwtService.signAsync(payload);

    return { user: { userId, name, email, role, profileImage, type, active, emailVerified }, token };
  }

  async requestReset(requestResetDto: RequestResetDto): Promise<{ message: string }> {
    const { identifier } = requestResetDto;

    if (!identifier) {
      throw new UnauthorizedException('Identifier is required.');
    }

    const user = await this.prisma.user.findFirst({
      where: { OR: [{ email: identifier }, { phoneNumber: identifier }] },
    });

    if (!user) throw new UnauthorizedException('User not found.');

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await this.prisma.otp.create({
      data: {
        userId: user.userId,
        otpCode,
        identifier,
        expiresAt,
      },
    });

    if (identifier.includes('@')) {
      await this.mailService.sendOtpEmail(user.email, otpCode);
    }

    return { message: 'OTP sent successfully.' };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<{ message: string }> {
    const { identifier, otpCode } = verifyOtpDto;

    const user = await this.prisma.user.findFirst({
      where: { OR: [{ email: identifier }, { phoneNumber: identifier }] },
    });

    if (!user) throw new UnauthorizedException('User not found.');

    const otpRecord = await this.prisma.otp.findFirst({
      where: {
        userId: user.userId,
        otpCode,
        identifier,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) throw new UnauthorizedException('Invalid OTP.');
    if (new Date() > otpRecord.expiresAt) throw new UnauthorizedException('OTP has expired.');

    await this.prisma.user.update({
      where: { userId: user.userId },
      data: { emailVerified: true },
    });

    await this.prisma.otp.delete({ where: { id: otpRecord.id } });

    return { message: 'OTP verified successfully. Email has been verified.' };
  }

  async verifyOtpAndSendResetLink(verifyOtpDto: VerifyOtpDto): Promise<{ message: string }> {
    const { identifier, otpCode } = verifyOtpDto;

    const user = await this.prisma.user.findFirst({
      where: { OR: [{ email: identifier }, { phoneNumber: identifier }] },
    });

    if (!user) throw new UnauthorizedException('User not found.');

    const otpRecord = await this.prisma.otp.findFirst({
      where: {
        userId: user.userId,
        otpCode,
        identifier,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) throw new UnauthorizedException('Invalid OTP.');
    if (new Date() > otpRecord.expiresAt) throw new UnauthorizedException('OTP has expired.');

    const OTPGen = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await this.prisma.otp.update({
      where: { id: otpRecord.id },
      data: {
        otpCode: OTPGen,
        expiresAt: expiresAt,
      },
    });

    const resetLink = ` http://localhost:${process.env.PORT ?? 3000}/reset-password?token=${OTPGen}`;

    if (identifier.includes('@')) {
      await this.mailService.sendResetLink(user.email, resetLink);
    }

    return { message: 'OTP verified successfully. Reset link sent.' };
  }

  async validateResetToken(token: string): Promise<boolean> {
    const otpRecord = await this.prisma.otp.findFirst({
      where: { otpCode: token },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      throw new UnauthorizedException('Invalid reset token.');
    }

    if (new Date() > otpRecord.expiresAt) {
      throw new UnauthorizedException('Reset token has expired.');
    }

    return true;
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    const { token, newPassword, identifier } = resetPasswordDto;

    const otpRecord = await this.prisma.otp.findFirst({
      where: { otpCode: token },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      throw new UnauthorizedException('Invalid reset token.');
    }

    if (new Date() > otpRecord.expiresAt) {
      throw new UnauthorizedException('Reset token has expired.');
    }

    const user = await this.prisma.user.findUnique({
      where: { userId: otpRecord.userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    if (identifier && otpRecord.identifier !== identifier) {
      throw new UnauthorizedException('Invalid reset request.');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { userId: user.userId },
        data: { password: hashedPassword },
      }),
      this.prisma.otp.delete({
        where: { id: otpRecord.id },
      }),
    ]);

    return { message: 'Password has been reset successfully. You can now login with your new password.' };
  }

  async logout(): Promise<{ message: string }> {
    return { message: 'Successfully logged out' };
  }
}

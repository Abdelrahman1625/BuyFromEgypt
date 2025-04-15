import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dtos/Register.dto';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { LoginDto } from './dtos/Login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async register(registerDto: RegisterDto): Promise<{ user: User; message: string }> {
    const existingUser = await this.prisma.user.findFirst({
      where: { OR: [{ email: registerDto.email }, { phoneNumber: registerDto.phoneNumber }, { taxId: registerDto.taxId }] },
      select: { email: true, phoneNumber: true, taxId: true },
    });

    if (existingUser) {
      throw new UnauthorizedException(
        existingUser.email === registerDto.email || existingUser.phoneNumber === registerDto.phoneNumber ? 'Email Or Phone number is already exists' : 'Tax ID is already exists'
      );
    }

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
  }

  async login(loginDto: LoginDto): Promise<{ user: User; token: string }> {
    const user = await this.prisma.user.findFirst({ where: { email: loginDto.email } });

    if (!user) throw new UnauthorizedException('The email address is not registered.');
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('The Email Or Password you entered is incorrect.');

    if (!user.active) throw new ForbiddenException("Account under review. You'll be notified upon verification.");

    const payload = { userId: user.userId, email: user.email, active: user.active, role: user.role, type: user.type };

    const token = await this.jwtService.signAsync(payload);

    return { user, token };
  }
}

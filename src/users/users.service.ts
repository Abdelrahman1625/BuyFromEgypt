import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateUserForAdminDto } from './dto/update-user.dto';
import { UpdateUserDto } from './dto/update-userForAdmin.dto';
import { ValidationService } from '../common/validation/validation.service';
import { MailService } from '../MailService/mail.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private validationService: ValidationService,
    private mailService: MailService
  ) {}

  async findAll() {
    return this.prisma.user.findMany();
  }

  async getUser(userId: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { userId } });
    if (!user) throw new NotFoundException(`User with ID '${userId}' not found.`);
    return user;
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const newUser = await this.prisma.user.create({ data: createUserDto });
    return newUser;
  }

  async updateUser<T extends UpdateUserDto | UpdateUserForAdminDto>(userId: string, updateDto: T): Promise<User> {
    const updatedUser = await this.prisma.user.update({ where: { userId }, data: { ...updateDto } });
    return updatedUser;
  }

  async deleteUser(userId: string): Promise<string> {
    await this.prisma.user.delete({ where: { userId } });
    return `User with ID ${userId} has been deleted successfully.`;
  }

  async toggleUserState(userId: string, state: 'approve' | 'deactivate'): Promise<{ message: string }> {
    const user = await this.prisma.user.findFirst({ where: { userId } });

    if (!user) throw new NotFoundException(`User with ID ${userId} not found.`);

    const isActive = !user.active;

    await this.prisma.user.update({
      where: { userId },
      data: { active: isActive },
    });

    if (state === 'approve' && isActive && user.email) {
      await this.mailService.sendMail({
        to: user.email,
        subject: 'Account Activated',
        html: `
          <h1>Your Account Has Been Activated</h1>
          <p>Dear ${user.name},</p>
          <p>Your account has been successfully activated. You can now log in and use all features.</p>
          <p>Thank you for joining us!</p>
        `,
      });
    }

    return { message: `User with ID ${userId} has been ${isActive ? 'approved' : 'deactivated'} successfully.` };
  }
}

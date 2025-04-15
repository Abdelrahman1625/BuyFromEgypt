import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateUserForAdminDto } from './dto/update-userForAdmin.dto';
import { UpdateUserDto } from './dto/update-user.dto';


@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: createUserDto.email }, { phoneNumber: createUserDto.phoneNumber }, { taxId: createUserDto.taxId }],
      },
    });
    if (existingUser) {
      throw new ConflictException(`User with this email already exists.`);
    }

    const newUser = await this.prisma.user.create({ data: createUserDto });
    return newUser;
  }

  async findAll() {
    return this.prisma.user.findMany();
  }

  async updateUser<T extends UpdateUserDto | UpdateUserForAdminDto>(userId: string, updateDto: T): Promise<User> {
    const user = await this.prisma.user.findFirst({ where: { userId } });
    if (!user) {
      throw new NotFoundException(`User with this ID not found.`);
    }
    const updatedUser = await this.prisma.user.update({ where: { userId }, data: { ...updateDto } });
    return updatedUser;
  }

  async deleteUser(userId: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findFirst({ where: { userId } });
    if (!user) {
      throw new NotFoundException(`User with this ID not found.`);
    }
    await this.prisma.user.delete({ where: { userId } });
    return {
      message: `User with ID ${userId} has been deleted successfully.`,
    };
  }

  async toggleUserState(userId: string, state: 'approve' | 'deactivate'): Promise<{ message: string }> {
    const user = await this.prisma.user.findFirst({ where: { userId } });

    if (!user) throw new NotFoundException(`User with ID ${userId} not found.`);

    const isActive = user.active;

    if (state === 'approve' && isActive) throw new ConflictException(`User with ID ${userId} is already activated.`);

    if (state === 'deactivate' && !isActive) throw new ConflictException(`User with ID ${userId} is already deactivated.`);

    await this.prisma.user.update({
      where: { userId },
      data: { active: state === 'approve' },
    });

    return { message: `User with ID ${userId} has been ${state === 'approve' ? 'approved' : 'deactivated'} successfully.` };
  }
}

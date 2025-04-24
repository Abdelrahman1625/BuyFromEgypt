import { Global, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Global()
@Injectable()
export class ValidationService {
  constructor(private readonly prisma: PrismaService) {}

  async validateUserExists(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { userId } });
    if (!user) throw new NotFoundException('User not found.');
  }

  async validateProductExists(productId: string): Promise<void> {
    const product = await this.prisma.product.findUnique({ where: { productId } });
    if (!product) throw new NotFoundException('Product not found.');
  }
}

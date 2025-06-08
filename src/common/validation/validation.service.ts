import { Global, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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
    const product = await this.prisma.product.findUnique({
      where: { productId },
      include: {
        category: true,
        owner: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found.`);
    }

    if (!product.category) {
      throw new BadRequestException(`Product with ID ${productId} has no associated category.`);
    }

    if (!product.owner) {
      throw new BadRequestException(`Product with ID ${productId} has no associated owner.`);
    }
  }
}

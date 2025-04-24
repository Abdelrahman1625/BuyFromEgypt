import { Global, Module } from '@nestjs/common';
import { ValidationService } from './validation.service';
import { PrismaService } from '../../../prisma/prisma.service';

@Global()
@Module({
  providers: [ValidationService, PrismaService],
  exports: [ValidationService],
})
export class ValidationModule {}

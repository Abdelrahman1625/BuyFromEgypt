import { Module } from '@nestjs/common';
import { MobileService } from './mobile.service';
import { MobileController } from './mobile.controller';

@Module({
  providers: [MobileService],
  // controllers: [MobileController],
  exports: [MobileService],
})
export class MobileModule {}

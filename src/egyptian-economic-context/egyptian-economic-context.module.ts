import { Module } from '@nestjs/common';
import { EgyptianEconomicContextController } from './egyptian-economic-context.controller';
import { EgyptianEconomicContextService } from './egyptian-economic-context.service';

@Module({
  controllers: [EgyptianEconomicContextController],
  providers: [EgyptianEconomicContextService],
  exports: [EgyptianEconomicContextService],
})
export class EgyptianEconomicContextModule {}

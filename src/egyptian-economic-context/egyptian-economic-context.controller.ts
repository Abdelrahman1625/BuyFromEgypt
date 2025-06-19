import { Controller, Get } from '@nestjs/common';
import { EgyptianEconomicContextService } from './egyptian-economic-context.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Egyptian Economic Context')
@Controller('egyptian-economic-context')
export class EgyptianEconomicContextController {
  constructor(private readonly economicContextService: EgyptianEconomicContextService) {}

  @Get()
  @ApiOperation({ summary: 'Get current Egyptian economic context data used by the recommendation system' })
  @ApiResponse({ status: 200, description: 'Economic context data retrieved successfully' })
  async getContext() {
    return this.economicContextService.getContext();
  }
}

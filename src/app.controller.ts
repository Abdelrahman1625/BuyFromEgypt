import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('hi')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @ApiResponse({ status: 201, description: 'Hello World!' })
  @Get('hi')
  firstHiInProject(): string {
    return this.appService.firstHiInProject();
  }
}

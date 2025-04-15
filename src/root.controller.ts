import { Controller, Get } from '@nestjs/common';

@Controller()
export class RootController {
  @Get()
  getRoot() {
    return { message: 'API is running. Visit /api-docs for documentation.' };
  }
}

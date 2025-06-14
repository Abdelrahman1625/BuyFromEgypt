import { Controller, Get, Query } from '@nestjs/common';
import { SearchService, SearchType } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  async globalSearch(@Query('q') q: string, @Query('type') type: string) {
    return this.searchService.globalSearch(q, type as SearchType);
  }
}

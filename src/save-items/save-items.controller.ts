import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SaveItemsService } from './save-items.service';
import { CreateSaveItemDto } from './dto/create-save-item.dto';
import { UpdateSaveItemDto } from './dto/update-save-item.dto';

@Controller('save-items')
export class SaveItemsController {
  constructor(private readonly saveItemsService: SaveItemsService) {}


}

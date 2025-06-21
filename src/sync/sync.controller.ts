import { Controller, Post, Body } from '@nestjs/common';
import { SyncService, SyncUserData, SyncProductData, SyncOrderData } from './sync.service';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';

@ApiTags('Sync')
@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post('user')
  @ApiOperation({ summary: 'Synchronize user data with the recommendation system' })
  @ApiBody({ description: 'User data to sync' })
  @ApiResponse({ status: 200, description: 'User synced successfully' })
  async syncUser(@Body() body: SyncUserData) {
    return this.syncService.syncUser(body);
  }

  @Post('product')
  @ApiOperation({ summary: 'Synchronize product data with the recommendation system' })
  @ApiBody({ description: 'Product data to sync' })
  @ApiResponse({ status: 200, description: 'Product synced successfully' })
  async syncProduct(@Body() body: SyncProductData) {
    return this.syncService.syncProduct(body);
  }

  @Post('order')
  @ApiOperation({ summary: 'Synchronize order data with the recommendation system' })
  @ApiBody({ description: 'Order data to sync' })
  @ApiResponse({ status: 200, description: 'Order synced successfully' })
  async syncOrder(@Body() body: SyncOrderData) {
    return this.syncService.syncOrder(body);
  }

  @Post('all')
  @ApiOperation({ summary: 'Synchronize all data (users, products, orders) with the ML server' })
  @ApiResponse({ status: 200, description: 'All data synced successfully' })
  async syncAllData() {
    return this.syncService.syncAllData();
  }
}

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly syncService: SyncService) {}

  @Post('retrain')
  @ApiOperation({ summary: 'Trigger a full retraining of all recommendation models' })
  @ApiResponse({ status: 200, description: 'Model retraining initiated' })
  async retrain() {
    return this.syncService.retrainModels();
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface SyncUserData {
  userId: string;
  name: string;
  email?: string;
  type?: string;
  industrySector?: string;
  country?: string;
  active?: boolean;
}

export interface SyncProductData {
  productId: string;
  name: string;
  description?: string;
  price?: number;
  currencyCode?: string;
  categoryId?: string;
  ownerId: string;
  rating?: number;
  reviewCount?: number;
  active?: boolean;
  available?: boolean;
}

export interface SyncOrderData {
  orderId: string;
  importerId: string;
  exporterId?: string;
  products?: string[];
  totalPrice?: number;
  currencyCode?: string;
  createdAt?: string;
}

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);
  private readonly ML_SERVER_URL = process.env.ML_SERVER_URL || 'http://localhost:8000';

  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService
  ) {}

  async syncUser(data: SyncUserData) {
    try {
      this.logger.log(`Syncing user: ${data.name} (${data.userId})`);

      const url = `${this.ML_SERVER_URL}/api/sync/user`;
      await firstValueFrom(this.httpService.post(url, data));

      return {
        success: true,
        message: `User ${data.name} (${data.userId}) synced successfully`,
        syncedItem: {
          userId: data.userId,
          name: data.name,
          type: data.type,
          email: data.email,
          industrySector: data.industrySector,
          country: data.country,
          active: data.active,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to sync user ${data.userId}: ${error.message}`);
      throw error;
    }
  }

  async syncProduct(data: SyncProductData) {
    try {
      this.logger.log(`Syncing product: ${data.name} (${data.productId})`);

      const url = `${this.ML_SERVER_URL}/api/sync/product`;
      await firstValueFrom(this.httpService.post(url, data));

      return {
        success: true,
        message: `Product ${data.name} (${data.productId}) synced successfully`,
        syncedItem: {
          productId: data.productId,
          name: data.name,
          description: data.description,
          price: data.price,
          currencyCode: data.currencyCode,
          categoryId: data.categoryId,
          ownerId: data.ownerId,
          rating: data.rating,
          reviewCount: data.reviewCount,
          active: data.active,
          available: data.available,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to sync product ${data.productId}: ${error.message}`);
      throw error;
    }
  }

  async syncOrder(data: SyncOrderData) {
    try {
      this.logger.log(`Syncing order: ${data.orderId}`);

      const url = `${this.ML_SERVER_URL}/api/sync/order`;
      await firstValueFrom(this.httpService.post(url, data));

      return {
        success: true,
        message: `Order ${data.orderId} synced successfully`,
        syncedItem: {
          orderId: data.orderId,
          importerId: data.importerId,
          exporterId: data.exporterId,
          productCount: data.products?.length || 0,
          totalPrice: data.totalPrice,
          currencyCode: data.currencyCode,
          createdAt: data.createdAt,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to sync order ${data.orderId}: ${error.message}`);
      throw error;
    }
  }

  async syncAllData() {
    try {
      this.logger.log('Starting full data sync with ML server...');

      const users = await this.prisma.user.findMany({
        select: {
          userId: true,
          name: true,
          email: true,
          type: true,
          industrySector: true,
          country: true,
          active: true,
        },
      });

      for (const user of users) {
        await this.syncUser({
          ...user,
          industrySector: user.industrySector || undefined,
        });
      }

      const products = await this.prisma.product.findMany({
        select: {
          productId: true,
          name: true,
          description: true,
          price: true,
          currencyCode: true,
          categoryId: true,
          ownerId: true,
          rating: true,
          reviewCount: true,
          active: true,
          available: true,
          category: {
            select: {
              name: true,
            },
          },
        },
      });

      for (const product of products) {
        await this.syncProduct({
          ...product,
          description: product.description || undefined,
          rating: product.rating || undefined,
        });
      }

      const orders = await this.prisma.order.findMany({
        select: {
          orderId: true,
          importerId: true,
          exporterId: true,
          totalPrice: true,
          currencyCode: true,
          createdAt: true,
          products: {
            select: {
              productId: true,
            },
          },
        },
      });

      for (const order of orders) {
        await this.syncOrder({
          ...order,
          exporterId: order.exporterId || undefined,
          products: order.products.map((p) => p.productId),
          createdAt: order.createdAt.toISOString(),
        });
      }

      this.logger.log('Full data sync completed successfully');
      return {
        success: true,
        message: 'Full data sync completed successfully',
        syncedItem: {
          usersCount: users.length,
          productsCount: products.length,
          ordersCount: orders.length,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to sync all data: ${error.message}`);
      throw error;
    }
  }

  async retrainModels() {
    try {
      this.logger.log('Initiating model retraining...');

      // First sync all data
      await this.syncAllData();

      // Then trigger retraining
      const url = `${this.ML_SERVER_URL}/api/retrain`;
      await firstValueFrom(this.httpService.post(url, {}));

      this.logger.log('Model retraining initiated successfully');

      return {
        success: true,
        message: 'Model retraining initiated. This may take some time to complete.',
        syncedItem: null,
      };
    } catch (error) {
      this.logger.error(`Failed to retrain models: ${error.message}`);
      throw error;
    }
  }
}

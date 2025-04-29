import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { Logger } from '@nestjs/common';

/**
 * Custom Socket.IO adapter that can use Redis for production
 * and fallback to in-memory for development
 */
export class SocketIOAdapter extends IoAdapter {
  private readonly logger = new Logger('SocketIOAdapter');
  private redisAdapter: any;

  constructor(app: any) {
    super(app);
  }

  async connectToRedis(): Promise<void> {
    if (process.env.NODE_ENV === 'production' && process.env.REDIS_URL) {
      try {
        const pubClient = createClient({ url: process.env.REDIS_URL });
        const subClient = pubClient.duplicate();

        await Promise.all([pubClient.connect(), subClient.connect()]);

        this.redisAdapter = createAdapter(pubClient, subClient);
        this.logger.log('Redis adapter created successfully');
      } catch (error) {
        this.logger.error(`Failed to connect to Redis: ${error.message}`);
      }
    }
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, {
      ...options,
      cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PATCH'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
      path: '/socket.io',
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    if (this.redisAdapter) {
      server.adapter(this.redisAdapter);
      this.logger.log('Using Redis adapter for Socket.IO');
    } else {
      this.logger.log('Using in-memory adapter for Socket.IO');
    }

    return server;
  }
}

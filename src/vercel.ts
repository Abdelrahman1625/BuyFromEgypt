import express from 'express';
import { ExpressAdapter } from '@nestjs/platform-express';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './swagger';
import { VercelRequest, VercelResponse } from '@vercel/node';

const server = express();
let cachedApp: express.Express;

async function bootstrap(): Promise<express.Express> {
  if (cachedApp) return cachedApp;

  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
  setupSwagger(app);
  await app.init();

  cachedApp = server;
  return server;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const app = await bootstrap();
    return app(req, res);
  } catch (error) {
    console.error('Error in Vercel handler:', error);
    res.status(500).send('Internal Server Error');
  }
}

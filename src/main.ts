import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { PrismaExceptionFilter } from './common/filters/all-exceptions.filter';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { join } from 'path';

const server = express();
let cachedApp: any;

async function bootstrap() {
  if (!cachedApp) {
    const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
      cors: true,
      logger: ['error', 'warn', 'debug', 'log'],
    });

    app.setGlobalPrefix('api/v1');

    // Serve static files from the public directory
    app.use('/swagger-ui', express.static(join(__dirname, '..', 'public', 'swagger-ui')));

    app.getHttpAdapter().get('/', (req, res) => {
      res.json({ message: 'API is running. Visit /api-docs for documentation.' });
    });

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        exceptionFactory: (errors) => {
          const errorMessage = errors.map((err) => Object.values(err.constraints || {}).join(', ')).join(', ') || 'Validation failed';
          return new BadRequestException(`${errorMessage}`);
        },
      })
    );

    const httpAdapter = app.get(HttpAdapterHost);
    app.useGlobalFilters(new PrismaExceptionFilter(httpAdapter));

    const config = new DocumentBuilder().setTitle('Buy From Egypt API').setDescription('API Documentation for Buy From Egypt').setVersion('1.0').addBearerAuth().build();

    const document = SwaggerModule.createDocument(app, config);

    // Save the Swagger JSON file
    const fs = require('fs');
    fs.writeFileSync(join(__dirname, '..', 'public', 'swagger.json'), JSON.stringify(document, null, 2));

    SwaggerModule.setup('api-docs', app, document, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'Buy From Egypt API Documentation',
      swaggerOptions: {
        persistAuthorization: true,
        url: '/swagger.json',
      },
    });

    await app.init();
    cachedApp = app;
  }

  return cachedApp;
}

// For local development
if (process.env.NODE_ENV !== 'production') {
  bootstrap().then(async (app) => {
    const port = process.env.PORT ?? 3000;
    await app.listen(port);
    console.log(`📄 Swagger Docs available at: http://localhost:${port}/api-docs`);
  });
}

export default async function handler(req: any, res: any) {
  const app = await bootstrap();
  const expressInstance = app.getHttpAdapter().getInstance();
  return expressInstance(req, res);
}

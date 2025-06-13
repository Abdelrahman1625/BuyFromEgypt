import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaExceptionFilter } from './common/filters/all-exceptions.filter';
import { setupSwagger } from './swagger';
import { SocketIOAdapter } from './socketio.adapter';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');

  // Add global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors) => {
        const messages = errors.map((error) => ({
          field: error.property,
          message: error.constraints ? Object.values(error.constraints)[0] : 'Invalid value',
        }));
        return {
          statusCode: 400,
          message: 'Validation failed',
          errors: messages,
        };
      },
    })
  );

  const httpAdapter = app.get(HttpAdapterHost);
  app.useGlobalFilters(new PrismaExceptionFilter(httpAdapter));

  const socketIoAdapter = new SocketIOAdapter(app);
  await socketIoAdapter.connectToRedis();
  app.useWebSocketAdapter(socketIoAdapter);

  setupSwagger(app);

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📄 Swagger Docs available at: http://localhost:${port}/api-docs`);
}

bootstrap(); // Directly call bootstrap

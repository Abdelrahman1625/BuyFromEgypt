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

  const adapter = new SocketIOAdapter(app);
  await adapter.connectToRedis();
  app.useWebSocketAdapter(adapter);

  setupSwagger(app);

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  const PORT = process.env.PORT || 3000;
  await app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`📄 Swagger Docs available at: http://localhost:${PORT}/api-docs`);
  });
}

if (require.main === module) {
  bootstrap();
}

export default bootstrap;

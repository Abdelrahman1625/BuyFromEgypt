import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaExceptionFilter } from './common/filters/all-exceptions.filter';
import { setupSwagger } from './swagger';
import { SocketIOAdapter } from './socketio.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');

  const httpAdapter = app.get(HttpAdapterHost);
  app.useGlobalFilters(new PrismaExceptionFilter(httpAdapter));

  const socketIoAdapter = new SocketIOAdapter(app);
  if (process.env.NODE_ENV === 'production') {
    await socketIoAdapter.connectToRedis();
  }
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

if (require.main === module) {
  bootstrap();
}

export default bootstrap;

import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { PrismaExceptionFilter } from './common/filters/all-exceptions.filter';
import { BadRequestException, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        // const errorMessage = errors[0]?.constraints ? Object.values(errors[0].constraints)[0] : 'Validation failed';
        const errorMessage = errors.map((err) => Object.values(err.constraints || {}).join(', ')).join(', ') || 'Validation failed';
        return new BadRequestException(`${errorMessage}`);
      },
    })
  );
  const httpAdapter = app.get(HttpAdapterHost);
  app.useGlobalFilters(new PrismaExceptionFilter(httpAdapter));

  const config = new DocumentBuilder().setTitle('Buy From Egypt API').setDescription('API Documentation for Buy From Egypt').setVersion('1.0').build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
  console.log('📄 Swagger Docs available at: http://localhost:3000/api-docs');
}

bootstrap();

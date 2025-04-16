import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder().setTitle('Buy From Egypt').setDescription('Buy From Egypt API Documentation').setVersion('1.0').addBearerAuth().build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api-docs', app, document, {
    customSiteTitle: 'Buy From Egypt API Docs',
    customJs: ['https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js', 'https://unpkg.com/swagger-ui-dist/swagger-ui-standalone-preset.js'],
    customCssUrl: 'https://unpkg.com/swagger-ui-dist/swagger-ui.css',
    swaggerOptions: {
      docExpansion: 'none',
      filter: true,
      persistAuthorization: true,
    },
  });
}

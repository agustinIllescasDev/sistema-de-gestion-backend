//main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import {SwaggerModule, DocumentBuilder} from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Sistema de Gestión - Compra/Venta')
    .setDescription('Documentación de la API para el sistema de gestión de compra y venta de artículos usados.')
    .setVersion('1.0')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);
  
  const uploadDir = './uploads/articulos';
  if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir, { recursive: true });
  }

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true, // Para convertir los datos de multipart/form-data
  },
  }));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

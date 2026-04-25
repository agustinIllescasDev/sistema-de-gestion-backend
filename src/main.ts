//main.ts
import cors from 'cors';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //app.enableCors();

  app.enableCors({
    // Permitimos cualquier origen temporalmente para que el túnel funcione en el celular
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    // Esto es clave para túneles: permite que pasen los headers de autenticación
    allowedHeaders: 'Content-Type, Accept, Authorization, X-Requested-With',
  });

  const config = new DocumentBuilder()
    .setTitle('Sistema de Gestión - Compra/Venta')
    .setDescription(
      'Documentación de la API para el sistema de gestión de compra y venta de artículos usados.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);

  const uploadDir = './uploads/articulos';
  if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir, { recursive: true });
  }

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true, // Para convertir los datos de multipart/form-data
      },
    }),
  );

  //await app.listen(process.env.PORT ?? 3000);

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();

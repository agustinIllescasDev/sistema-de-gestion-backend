import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // disponible en todo el proyecto evitando imports repetitivos en cada modulo.
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const host = config.get<string>('DB_HOST');
        const port = config.get<number>('DB_PORT');
        const user = config.get<string>('DB_USER');
        const pass = config.get<string>('DB_PASSWORD');
        const name = config.get<string>('DB_NAME');

        if (!host || !port || !user || !pass || !name) {
          throw new Error(
            '❌ Variables de entorno de base de datos faltantes. Revisa el archivo .env',
          );
        }

        return {
          type: 'postgres',
          host: host,
          port: port,
          username: user,
          password: pass,
          database: name,
          autoLoadEntities: true,
          synchronize: config.get('NODE_ENV') === 'development',
          logging: ['error'],
        };
      },
    }), // Se cerró correctamente el paréntesis y llave del TypeOrmModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
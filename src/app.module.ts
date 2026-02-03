//app.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import {ArticulosModule} from 'src/modules/articulos/articulos.module'
import { CategoriasModule } from './modules/categorias/categorias.module';
import { AdministradoresModule } from './modules/administradores/administradores.module';
import { ReportesModule } from './modules/reportes/reportes.module';
import { MediaModule } from './modules/media/media.module';
import { AuthModule } from './modules/auth/auth.module';

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
          //synchronize: true,
          synchronize: config.get('NODE_ENV') === 'development',

          logging: config.get('NODE_ENV') === 'development' ? true : ['error'],
          //logging:true,
        };
      },
    }),
    ArticulosModule,
    CategoriasModule,
    AdministradoresModule,
    ReportesModule,
    MediaModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
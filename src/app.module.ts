import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true, //disponible en todo el proyecto evitando imports repetitivos en cada modulo.
  })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

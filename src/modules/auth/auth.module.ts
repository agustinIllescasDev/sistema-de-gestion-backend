//auth.module.ts

import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import {AdministradoresModule} from 'src/modules/administradores/administradores.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [AdministradoresModule,
            PassportModule,
            JwtModule.registerAsync({
              imports: [ConfigModule],
              inject: [ConfigService],
               useFactory: (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'),
                signOptions: {expiresIn: '24h'},
               }),
            }),
          ],
  controllers: [AuthController],
  providers: [AuthService, 
              JwtStrategy,
            ],
})

export class AuthModule {}

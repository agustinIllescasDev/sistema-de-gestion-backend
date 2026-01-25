//administradores.module.ts

import {Module} from '@nestjs/common'
import {TypeOrmModule} from '@nestjs/typeorm'
import { Administrador } from 'src/entities/administrador.entity';
import {AdministradoresController} from 'src/modules/administradores/administradores.controller'
import {AdministradoresService} from 'src/modules/administradores/administradores.service'

@Module({
    imports: [
        TypeOrmModule.forFeature([Administrador])
    ],
    controllers: [AdministradoresController],
    providers: [AdministradoresService],
    exports: [
        TypeOrmModule, AdministradoresService
    ]
    
    
})

export class AdministradoresModule {}
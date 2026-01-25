import {Module} from '@nestjs/common'
import {TypeOrmModule} from '@nestjs/typeorm'
import { Categoria } from 'src/entities/categoria.entity';
import { CategoriasService} from 'src/modules/categorias/categorias.service'
import { CategoriasController} from 'src/modules/categorias/categorias.controller'

@Module({
    imports: [
        TypeOrmModule.forFeature([Categoria])
    ],

    controllers: [CategoriasController],

    providers:[
        CategoriasService
    ],

    exports: [
        TypeOrmModule, CategoriasService
    ]
}) 

export class CategoriasModule {}
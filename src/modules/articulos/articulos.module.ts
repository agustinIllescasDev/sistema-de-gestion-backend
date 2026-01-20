import {Module} from '@nestjs/common'
import {TypeOrmModule} from '@nestjs/typeorm'
import { Articulo } from 'src/entities/articulo.entity';
import { Categoria } from 'src/entities/categoria.entity';
import {ArticulosService} from './articulos.service'

@Module({
    imports: [
    // imports de entidades para typeORM
    TypeOrmModule.forFeature([Articulo, Categoria])
    ],
    providers: [
        ArticulosService
    ],
    exports: [
        TypeOrmModule, ArticulosService
    ]
})

export class ArticulosModule {}
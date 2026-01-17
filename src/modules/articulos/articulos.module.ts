import {Module} from '@nestjs/common'
import {TypeOrmModule} from '@nestjs/typeorm'
import { Articulo } from 'src/entities/articulo.entity';
import { Categoria } from 'src/entities/categoria.entity';

@Module({
    imports: [
    TypeOrmModule.forFeature([Articulo, Categoria])
    ],
    exports: [
        TypeOrmModule,
    ]
})

export class ArticulosModule {}
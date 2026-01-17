import {Module} from '@nestjs/common'
import {TypeOrmModule} from '@nestjs/typeorm'
import { Categoria } from 'src/entities/categoria.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Categoria])
    ],
    exports: [
        TypeOrmModule,
    ]
})

export class CategoriasModule {}
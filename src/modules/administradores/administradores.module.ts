import {Module} from '@nestjs/common'
import {TypeOrmModule} from '@nestjs/typeorm'
import { Administrador } from 'src/entities/administrador.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Administrador])
    ],
    exports: [
        TypeOrmModule,
    ]
})

export class AdministradoresModule {}
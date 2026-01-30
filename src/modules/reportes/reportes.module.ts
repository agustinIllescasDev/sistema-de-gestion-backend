//reportes.module.ts

import { Module } from '@nestjs/common';
import { ReportesService } from './reportes.service';
import { ReportesController } from './reportes.controller';
import { ArticulosModule } from '../articulos/articulos.module';

@Module({imports: [ArticulosModule], // <--- Para que funcione ArticulosService
    controllers: [ReportesController], // <--- ESTO ACTIVA LA RUTA /pdf
    providers: [ReportesService],
    exports: [ReportesService]
})
export class ReportesModule {

}
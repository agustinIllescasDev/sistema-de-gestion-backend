//reportes.controller.ts

import { Controller, Get, Res, UseGuards } from "@nestjs/common";
import express from 'express';
import { ArticulosService } from "../articulos/articulos.service";
import {ReportesService} from 'src/modules/reportes/reportes.service';
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { ApiBearerAuth } from '@nestjs/swagger';


@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pdf')
export class ReportesController{
    constructor(private readonly articulosService: ArticulosService,
        private readonly reportesService: ReportesService
    ) {}


@Get('catalogo')
async descargarCatalogo(@Res() res: express.Response) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename=reporte-stock.pdf');

    const filas = await this.articulosService.obtenerDatosReporteStock();
    
    const encabezados = ['Codigo', 'Nombre', 'Categoria','Precio base', 'Precio de lista'];
    await this.reportesService.streamArchivoPDF(res, 'Catalogo completo', encabezados, filas);
}


@Get('ventas')
async descargarReporteVentas(@Res() res: express.Response) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename=reporte-ventas.pdf');

    const filas = await this.articulosService.obtenerDatosReporteVentas();
    
    const encabezados = ['Codigo', 'Nombre', 
                        'Categoria', 'Fecha de venta',
                        'Precio base','Precio de Venta',
                        'Porcentaje de ganancia', 'Total de ganancia'];
                        
    await this.reportesService.streamArchivoPDF(res, 'Reporte de ventas', encabezados, filas);
}

}
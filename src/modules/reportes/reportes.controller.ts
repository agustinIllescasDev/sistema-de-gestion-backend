//reportes.controller.ts

import { Controller, Get, Res } from "@nestjs/common";
import express from 'express';
import { ArticulosService } from "../articulos/articulos.service";
import {ReportesService} from 'src/modules/reportes/reportes.service';

//Ruta
@Controller('pdf')
export class ReportesController{
    constructor(private readonly articulosService: ArticulosService,
        private readonly reportesService: ReportesService
    ) {}

@Get('stock')
async descargarReporteStock(@Res() res: express.Response) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=reporte-stock.pdf');

    const filas = await this.articulosService.obtenerDatosReporteStock();
    
    const encabezados = ['Codigo', 'Nombre', 'Categoria','Precio Base', 'Precio Venta'];
    await this.reportesService.streamArchivoPDF(res, 'Reporte de artículos en stock', encabezados, filas);
}

@Get('ventas')
async descargarReporteVentas(@Res() res: express.Response) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=reporte-ventas.pdf');

    const filas = await this.articulosService.obtenerDatosReporteVentas();
    
    const encabezados = ['Codigo', 'Nombre', 
                        'Categoria', 'Fecha de venta',
                        'Precio base','Precio de Venta',
                        'Porcentaje de ganancia', 'Total de ganancia'];
                        
    await this.reportesService.streamArchivoPDF(res, 'Reporte de ventas', encabezados, filas);
}



}
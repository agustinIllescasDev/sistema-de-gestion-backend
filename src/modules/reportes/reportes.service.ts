//reportes.service.ts

import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import PDFDocument from 'pdfkit-table';

@Injectable()
export class ReportesService {
    
    async streamArchivoPDF(res: Response, titulo:string, encabezados: string[], filas: any[]){
        const doc = new PDFDocument({margin:30,size: 'A4'});
        doc.pipe(res);

        const tabla ={
            title: titulo,
            headers: encabezados,
            rows: filas,
        }
        await doc.table(tabla,{
            prepareHeader: () => doc.font('Helvetica-Bold').fontSize(10),
            prepareRow: () => doc.font('Helvetica').fontSize(10), 
        });

        doc.end()
    }

}

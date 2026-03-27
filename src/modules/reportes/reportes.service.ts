// //reportes.service.ts

// import { Injectable } from '@nestjs/common';
// import { Response } from 'express';
// import PDFDocument from 'pdfkit-table';

// @Injectable()
// export class ReportesService {
//   async streamArchivoPDF(
//     res: Response,
//     titulo: string,
//     encabezados: string[],
//     filas: any[],
//   ) {
//     const doc = new PDFDocument({ margin: 30, size: 'A4' });
//     doc.pipe(res);

//     const tabla = {
//       title: titulo,
//       headers: encabezados,
//       rows: filas,
//     };
//     await doc.table(tabla, {
//       prepareHeader: () => doc.font('Helvetica-Bold').fontSize(10),
//       prepareRow: () => doc.font('Helvetica').fontSize(10),
//     });

//     doc.end();
//   }
import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import PDFDocument from 'pdfkit-table';

@Injectable()
export class ReportesService {
  async streamArchivoPDF(
    res: Response,
    titulo: string,
    encabezados: string[],
    filas: any[],
  ) {
    // 1. Crear el documento con buffers de página para el pie de página
    const doc = new PDFDocument({
      margin: 40,
      size: 'A4',
      bufferPages: true,
    });

    // Conectar el stream con la respuesta de Express
    doc.pipe(res);

    // --- 2. ENCABEZADO DEL REPORTE ---
    // Título principal
    doc
      .fillColor('#0ea5e9') // Color celeste profesional
      .font('Helvetica-Bold')
      .fontSize(20)
      .text(titulo.toUpperCase(), { align: 'left' });

    // Fecha de generación
    doc
      .fillColor('#64748b')
      .fontSize(10)
      .font('Helvetica')
      .text(`Generado el: ${new Date().toLocaleDateString('es-AR')}`, {
        align: 'right',
      });

    // Línea divisoria decorativa
    doc.moveTo(40, 75).lineTo(550, 75).strokeColor('#e2e8f0').stroke();

    doc.moveDown(2); // Espacio antes de la tabla

    // --- 3. CONFIGURACIÓN DE LA TABLA ---
    const tabla = {
      title: '',
      headers: encabezados.map((h) => ({
        label: h,
        // Generamos una propiedad compatible basada en el nombre del encabezado
        property: h.toLowerCase().replace(/ /g, '_'),
        headerColor: '#0ea5e9',
        headerOpacity: 1,
        color: '#ffffff',
      })),
      rows: filas,
    };

    // Generar la tabla
    await doc.table(tabla, {
      prepareHeader: () => {
        doc.font('Helvetica-Bold').fontSize(9).fillColor('#ffffff');
        return doc; // Retorno necesario para evitar error de tipo 'void'
      },
      prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
        doc.font('Helvetica').fontSize(9).fillColor('#1e293b');
        return doc; // Retorno necesario para evitar error de tipo 'void'
      },
      // Usamos 'as any' para evadir el error de tipos en el padding
      padding: [5, 5, 5, 5] as any,
      columnSpacing: 7,
      hideHeader: false,
      minRowHeight: 20,
    });

    // --- 4. PIE DE PÁGINA (Numeración de páginas) ---
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      doc
        .fontSize(8)
        .fillColor('#94a3b8')
        .text(
          `Página ${i + 1} de ${range.count} - Sistema de Gestión de Mueblería`,
          40,
          doc.page.height - 50,
          { align: 'center' },
        );
    }

    // Finalizar el documento
    doc.end();
  }
}

//media.controller.ts
import { Controller, Get, Param, NotFoundException, Res } from '@nestjs/common';
import type {Response} from 'express';
import {join}  from 'path';
import { existsSync } from 'fs';
import { MediaService } from './media.service';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get('articulos/:filename')
  async verImagen(@Param('filename') filename: string, @Res() res: Response){
    const path = join(process.cwd(),'uploads', 'articulos', filename);

    if(!existsSync(path)){
      throw new NotFoundException('El archivo no existe en el servidor');
    }
    return res.sendFile(path);
  }
}

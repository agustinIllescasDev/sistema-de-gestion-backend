//articulos.controller.ts

import { BadRequestException, Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import {ArticulosService} from './articulos.service'
import {CreateArticuloDto} from 'src/modules/articulos/dto/create-articulo.dto'
import { UpdateArticuloDto } from './dto/update-articulo.dto';
import { Estado } from 'src/common/enums/estado-articulo.enum';
import {FileInterceptor} from '@nestjs/platform-express'
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';


@Controller('articulos')
export class ArticulosController {
    constructor(private readonly articulosService: ArticulosService){}

    @UseInterceptors(FileInterceptor('imagen', {
        storage: diskStorage({
            destination: './uploads/articulos',
            filename:(req,file,cb) => {
                //const randomName = Array(32).fill(null).map(()=>(Math.round(Math.random() * 16)).toString(16)).join('');
                const extension = path.extname(file.originalname)
                const fileName = uuidv4();                
                cb(null, `${fileName}${extension}`)
            }
        }),

        fileFilter: (req, file, cb) => {
        // Definimos los formatos permitidos
        const allowedMimetypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
      
        if (allowedMimetypes.includes(file.mimetype)) {
            cb(null, true); // Aceptamos el archivo
        } else {
            cb(new BadRequestException('Solo se permiten imágenes (jpg, jpeg, png, webp)'), false);
        }
    },
        limits: {
            fileSize: 1024 * 1024 * 10, //Limite de 10MB
        }
    }))
    
    @Post()
    async create(@Body() dto: CreateArticuloDto,
                @UploadedFile() imagen?: Express.Multer.File){
        return this.articulosService.crear(dto, imagen?.filename);
    }
    
    @Get()
    async getAll(
        @Query('estado') estado?: Estado,
        @Query('pagina') pagina: number = 1, //Por defecto, devuelve la primer pagina de resultados.
        @Query('limite') limite: number = 10, //Por defecto, devuelve 10 resultados por pagina.
    ){
        return this.articulosService.obtenerTodos(estado, +pagina, +limite); //los valores que llegan desde la url son strings. Con '+' los convertimos a numero.
    }

    @Get(':id')
    async getOneById(@Param('id', ParseIntPipe) id: number){
        return this.articulosService.obtenerArticuloPorId(id)
    }

    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id:number,
        @Body() dto: UpdateArticuloDto) 
    {
        return this.articulosService.actualizarArticulo(dto, id);
    }

    @Delete(':id')
    eliminar(@Param('id', ParseIntPipe)id:number){
        return this.articulosService.eliminarArticulo(id)
    }

    @Patch(':id/vender')
    vender(@Param('id', ParseIntPipe)id:number){
        return this.articulosService.venderArticulo(id);
    }

    //Restaurar a null el campo fecha_venta (soft delete) del articulo
    @Patch(':id/restaurar')
    restaurar(@Param('id', ParseIntPipe) id:number){
        return this.articulosService.restoreArticulo(id)
    }
}



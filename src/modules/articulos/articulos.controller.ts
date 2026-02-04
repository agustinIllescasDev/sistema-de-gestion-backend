//articulos.controller.ts

import { BadRequestException, Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import {ArticulosService} from './articulos.service'
import {CreateArticuloDto} from 'src/modules/articulos/dto/create-articulo.dto'
import { UpdateArticuloDto } from './dto/update-articulo.dto';
import { Estado } from 'src/common/enums/estado-articulo.enum';
import {FileInterceptor} from '@nestjs/platform-express'
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';


@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('articulos')
export class ArticulosController {
    constructor(private readonly articulosService: ArticulosService){}


    //Crear un articulo
    //Recibir el archivo de imagen definiendo su nombre, ubicacion en el disco, tipo de archivo y tamaño maximo para poder guardarlo.
    @Post()
    @UseInterceptors(FileInterceptor('imagen', {
        storage: diskStorage({
            destination: './uploads/articulos',
            filename:(_req,file,cb) => { //El aprametro 'req' nunca es leido, pero se necesita por el orden de los parametros que recibe multer.
                const extension = path.extname(file.originalname)
                const fileName = uuidv4();                
                cb(null, `${fileName}${extension}`)
            }
        }),

        fileFilter: (_req, file, cb) => {
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

    async create(@Body() dto: CreateArticuloDto,
                @UploadedFile() imagen?: Express.Multer.File){
        return this.articulosService.crear(dto, imagen?.filename);
    }
   

    //Obtener todos los articulos (con filtros y paginacion)
    @Get()
    //documentacion de swagger
    @ApiOperation({ summary: 'Obtener artículos con filtros de estado, búsqueda por nombre y paginación' })
    @ApiQuery({ name: 'estado', required: false, enum: Estado, description: 'Filtrar por DISPONIBLE o VENDIDO' })
    @ApiQuery({ name: 'search', required: false, type: String, description: 'Buscar artículos por nombre' })
    @ApiQuery({ name: 'pagina', required: false, type: Number, description: 'Número de página' })
    @ApiQuery({ name: 'limite', required: false, type: Number, description: 'Cantidad de registros por página' })

    async getAll(
        @Query('estado') estado?: Estado,
        @Query('search') search?: string,
        @Query('pagina') pagina: number = 1, //Por defecto, devuelve la primer pagina de resultados.
        @Query('limite') limite: number = 20, //Por defecto, devuelve 20 resultados por pagina.
    ){
        return this.articulosService.obtenerTodos(estado, search, +pagina, +limite); //los valores que llegan desde la url son strings. Con '+' los convertimos a numero.
    }

    
    //Obtener un articulo por su id
    @Get(':id')
    async getOneById(@Param('id', ParseIntPipe) id: number){
        return this.articulosService.obtenerArticuloPorId(id)
    }


    //Actualizar un articulo

    //Recibir el archivo de imagen definiendo su nombre, ubicacion en el disco, tipo de archivo y tamaño maximo para poder guardarlo.
    @Patch(':id')
    @UseInterceptors(FileInterceptor('imagen', {
        storage: diskStorage({
            destination: './uploads/articulos',
            filename:(_req,file,cb) => { //El aprametro 'req' nunca es leido, pero se necesita por el orden de los parametros que recibe multer.
                const extension = path.extname(file.originalname)
                const fileName = uuidv4();                
                cb(null, `${fileName}${extension}`)
            }
        }),

        fileFilter: (_req, file, cb) => {
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

    async update(
        @Param('id', ParseIntPipe) id:number,
        @Body() dto: UpdateArticuloDto,
        @UploadedFile() imagen?: Express.Multer.File) 
    {
        return this.articulosService.actualizarArticulo(dto, id, imagen?.filename);
    }

    //Eliminar articulo
    @Delete(':id')
    eliminar(@Param('id', ParseIntPipe)id:number){
        return this.articulosService.eliminarArticulo(id)
    }


    //Vender articulo
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



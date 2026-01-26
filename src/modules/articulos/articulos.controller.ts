//articulos.controller.ts

import { Body, Controller, Delete, Get, Injectable, Param, ParseIntPipe, Patch, Post, Put, Query } from '@nestjs/common';
import {ArticulosService} from './articulos.service'
import {CreateArticuloDto} from 'src/modules/articulos/dto/create-articulo.dto'
import { UpdateArticuloDto } from './dto/update-articulo.dto';
import { Estado } from 'src/common/enums/estado-articulo.enum';

@Controller('articulos')
export class ArticulosController {
    constructor(private readonly articulosService: ArticulosService){}
    
    @Post()
    async create(@Body() dto: CreateArticuloDto){
        return this.articulosService.crear(dto);
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


    @Patch(':id/restaurar')
    restaurar(@Param('id', ParseIntPipe) id:number){
        return this.articulosService.restoreArticulo(id)
    }
}

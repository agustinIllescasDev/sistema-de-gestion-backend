//articulos.controller.ts

import { Body, Controller, Delete, Get, Injectable, Param, ParseIntPipe, Patch, Post, Put } from '@nestjs/common';
import {ArticulosService} from './articulos.service'
import {CreateArticuloDto} from 'src/modules/articulos/dto/create-articulo.dto'
import { UpdateArticuloDto } from './dto/update-articulo.dto';

@Controller('articulos')
export class ArticulosController {
    constructor(private readonly articulosService: ArticulosService){}
    
    @Post()
    async create(@Body() dto: CreateArticuloDto){
        return this.articulosService.crear(dto);
    }
    
    @Get()
    async getAll(){
        return this.articulosService.obtenerTodos();
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
}

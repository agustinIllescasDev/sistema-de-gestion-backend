//categorias.controller.ts

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  ParseIntPipe,
} from '@nestjs/common';

import { CategoriasService } from './categorias.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';


@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('categorias')
export class CategoriasController {
    //Instancia del Service
    constructor(private readonly categoriasService: CategoriasService){}

    //CRUD

    //Crear categoria.

    
    @Post()
    crear(@Body() dto: CreateCategoriaDto){
        return this.categoriasService.crearCategoria(dto.nombre);
    }

    //Obtener categoria.
    
    @Get()
    obtenerTodas(){
        return this.categoriasService.obtenerCategorias();
    }

    //Obtener por id categoria.
    
    @Get(':id')
    obtenerCategoriaPorId(@Param('id', ParseIntPipe) id: number){
        return this.categoriasService.obtenerCategoriaPorId(id);
    }

    //Actualizar categoria.
    
    @Put(':id')
    actualizar(
        @Param('id',ParseIntPipe) id: number,
        @Body() dto: UpdateCategoriaDto
    ){
        return this.categoriasService.actualizarCategoria(id,dto.nombre);
    }

    //Eliminar categoria.
    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    eliminar(@Param('id', ParseIntPipe) id: number){
        return this.categoriasService.eliminarCategoria(id);
    }

}
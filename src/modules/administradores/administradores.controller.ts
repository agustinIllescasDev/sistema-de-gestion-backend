//administradores.controller.ts

import {Controller, Post, Body, Patch, Param, ParseIntPipe, Get } from '@nestjs/common'
import { AdministradoresService } from './administradores.service';
import { CreateAdministradorDto } from './dto/create-administrador.dto';
import { UpdateAdministradorDto } from './dto/update-administrador.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('administradores')
export class AdministradoresController {
    constructor(private readonly administradoresService: AdministradoresService) {}
    
    @Post()
    async create(@Body() dto: CreateAdministradorDto) {
        return await this.administradoresService.crearAdministrador(dto);
    }

    
    @Patch(':id/cambiar-password')
    async updatePassword(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateAdministradorDto,
    ) {
        return await this.administradoresService.cambiarContraseña(id, dto);
    }

    
    @Get()
    async obtenerTodos(){
        return await this.administradoresService.obtenerTodos();
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async obtenerPorId(@Param('id', ParseIntPipe) id:number){
        return this.administradoresService.obtenerPorId(id);
    }
}
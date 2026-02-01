//administradores.controller.ts

import {Controller, Post, Body, Patch, Param, ParseIntPipe } from '@nestjs/common'
import { AdministradoresService } from './administradores.service';
import { CreateAdministradorDto } from './dto/create-administrador.dto';
import { UpdateAdministradorDto } from './dto/update-administrador.dto';

@Controller('administradores')
export class AdministradoresController {
    constructor(private readonly administradoresService: AdministradoresService) {}

    // Endpoint para registrar un nuevo administrador.
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
}
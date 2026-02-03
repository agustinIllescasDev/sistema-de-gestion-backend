//administradores.service.ts

import { InjectRepository } from "@nestjs/typeorm";
import {Administrador} from "src/entities/administrador.entity"
import {Repository} from "typeorm"
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateAdministradorDto } from "./dto/create-administrador.dto";
import * as bcrypt from 'bcrypt';
import { UpdateAdministradorDto } from "./dto/update-administrador.dto"

@Injectable()
export class AdministradoresService{
    constructor(
            @InjectRepository(Administrador)
            private readonly administradorRepository: Repository<Administrador>){}
    
    
    private validarNombre(nombre: string){
        if(!nombre || nombre.trim().length === 0 ){
            throw new BadRequestException("El nombre del administrador no puede estar vacío.");
        }
    }

    async crearAdministrador(dto: CreateAdministradorDto){
        this.validarNombre(dto.nombre)
        
        
        const emailExistente = await this.administradorRepository.findOneBy(
            {mail : dto.mail}
        )

        if(emailExistente){
            throw new BadRequestException('El email debe ser unico');
        }

        const passwordHash = await bcrypt.hash(dto.password, 10)

        const administrador = this.administradorRepository.create({
            nombre: dto.nombre,
            mail: dto.mail,
            password: passwordHash
        });

        const guardado = await this.administradorRepository.save(administrador);

        //'any' para que TS nos deje borrar la propiedad sin quejas
        delete (guardado as any).password

        //Retornamos el objeto creado, sin exponer innecesariamente la contraseña, aunque este hasheada, ya que el cliente no la necesita.
        return guardado;
    }

    async cambiarContraseña(id:number ,dto: UpdateAdministradorDto){
        const administrador = await this.administradorRepository.findOneBy({
            id_administrador: id
        });

        if(!administrador){
            throw new BadRequestException('Usuario no encontrado.');
        }

        const actualPasswordComparition = await bcrypt.compare(dto.passwordActual,  administrador.password)

        if(!actualPasswordComparition){
            throw new BadRequestException('Contraseña incorrecta');
        }

        if(dto. passwordNueva !== dto.passwordConfirm){
            throw new BadRequestException('La nueva contraseña no coincide con el campo de confirmacion');
        }

        const newPasswordHash = await bcrypt.hash(dto.passwordNueva,10)

        return await this.administradorRepository.update(id,{password: newPasswordHash});
    }

    async obtenerAdminPorSuEMail(email:string){
        return await this.administradorRepository.findOne({
            where: {mail : email}
        });
    }


    async obtenerTodos(){
        const administradores = await this.administradorRepository.find();
        
        if (!administradores) {
            throw new NotFoundException('No hay resultados');
        }

        return administradores
    }

    async obtenerPorId(id: number){
        const administrador = await this.administradorRepository.findOne({
            where: {id_administrador: id}
        })

        if(!administrador){
            throw new NotFoundException('Usuario no encontrado');
        }

        return administrador;
    }
    
}
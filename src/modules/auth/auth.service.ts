//auth.service.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AdministradoresService } from '../administradores/administradores.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt'


@Injectable()
export class AuthService {
    constructor(private readonly administradoresService: AdministradoresService,
        private readonly jwtService: JwtService){}

    
    async login(dto: LoginDto ){

        //obtenemos el admin por su id
        const admin = await this.administradoresService.obtenerAdminPorSuEMail(dto.mail);


        //si no se encuentra, no se autoriza el acceso.
        if (!admin){
            throw new UnauthorizedException('Credenciales incorrectas.');
        }

        //comparamos la contraseña recibida con el hash de la base de datos
        const passwordValida = await bcrypt.compare(dto.password,admin.password)

        //Si no coinciden las contraseñas, no se autoriza el acceso.
        if(!passwordValida){
            throw new UnauthorizedException('Credenciales incorrectas.');
        }

        //payload para jwt
        const payload = {
            sub: admin.id_administrador, //nota: "sub" es el estandar para guardar el id unico del usuario.
            email: admin.mail
        }

        //firma y retorno
        return {
            acces_token: this.jwtService.sign(payload)
        }        
    }
}

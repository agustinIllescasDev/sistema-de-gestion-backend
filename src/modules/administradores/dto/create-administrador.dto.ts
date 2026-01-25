//create-administradores.dto.ts

import {IsEmail,IsString, IsNotEmpty} from 'class-validator'


export class CreateAdministradorDto {
    @IsNotEmpty({message: 'El nombre no puede estar vacio.'})
    @IsString()
    nombre: string;

    @IsNotEmpty({message: 'El mail no puede estar vacio.'})
    @IsEmail()
    mail: string;

    @IsNotEmpty({message: 'La contraseña no puede estar vacia.'})
    @IsString()
    password: string;
}
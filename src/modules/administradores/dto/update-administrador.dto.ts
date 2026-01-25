//update-administradores.dto.ts

import {IsString, IsNotEmpty} from 'class-validator'


export class UpdateAdministradorDto {
    @IsNotEmpty({message: 'La conraseña actual no puede estar vacía.'})
    @IsString()
    passwordActual: string;

    @IsNotEmpty({message: 'La nueva conraseña es obligatoria.'})
    @IsString()
    passwordNueva: string;

    @IsNotEmpty({message: 'Debes confirmar la contraseña.'})
    @IsString()
    passwordConfirm: string;
}
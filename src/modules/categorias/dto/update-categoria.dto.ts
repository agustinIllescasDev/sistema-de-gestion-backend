import {IsNotEmpty,IsString} from 'class-validator'

export class UpdateCategoriaDto{
    @IsString()
    @IsNotEmpty({message: 'El nombre de la categoría no puede estar vacío'})
    nombre:string;
}
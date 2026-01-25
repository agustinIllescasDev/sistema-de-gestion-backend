import {IsNotEmpty,IsString} from 'class-validator'

export class CreateCategoriaDto{
    @IsString()
    @IsNotEmpty({message: 'El nombre de la categoría no puede estar vacío'})
    nombre:string;
}
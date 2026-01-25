//create-articulo.dto.ts

import { IsNotEmpty,IsNumber,IsOptional,IsString, Max, Min} from 'class-validator'

export class CreateArticuloDto{
    @IsString()
    @IsNotEmpty({message: 'El nombre no puede estar vacío'})
    nombre:string;

    @IsOptional()
    @IsString()
    descripcion?:string;

    @IsOptional()
    @IsString()
    imagen?: string;

    @Min(1,{message: 'El precio base debe ser mayor a 0'})
    @IsNumber()
    precio_base: number;

    @Min(1,{message: 'El porcentaje debe debe ser mayor a 0'})
    porcentaje_ganancia:number;

    @IsNumber()
    @IsNotEmpty()
    id_categoria: number;
    
}
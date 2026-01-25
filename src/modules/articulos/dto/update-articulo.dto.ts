//update-articulo.dto.ts

import { IsNotEmpty,IsNumber,IsOptional,IsString, Min} from 'class-validator'

export class UpdateArticuloDto{
    @IsOptional()
    @IsString()
    nombre?:string;

    @IsOptional()
    @IsString()
    descripcion?:string;

    @IsOptional()
    @IsString()
    imagen?: string;

    @IsOptional()
    @Min(1,{message: 'El precio base debe ser mayor a 0'})
    @IsNumber()
    precio_base?: number;

    @IsOptional()
    @Min(1,{message: 'El porcentaje debe debe ser mayor a 0'})
    porcentaje_ganancia?:number;

    @IsOptional()
    @IsNumber()
    id_categoria?: number;
    
}
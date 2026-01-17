import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn} from "typeorm" 
import {Estado} from 'src/common/enums/estado-articulo.enum'
import { Categoria } from "./categoria.entity";

@Entity('articulos')
export class Articulo {
    @PrimaryGeneratedColumn({name: 'id_articulo'})
    id_articulo: number

    @Column({name: 'nombre',type:'varchar',length:50, nullable: false})
    nombre: string;

    @Column({name: 'descripcion', type:'text', nullable: true})
    descripcion: string;

    @Column({name: 'imagen',type:'varchar',length:255, nullable: true})
    imagen: string;

    @Column({name: 'estado' ,type:'enum' , enum: Estado, nullable:false,})
    estado: Estado

    @Column({name: 'precio_base', type: 'decimal', precision:10, scale: 2})
    precio_base: number;

    @Column({name: 'precio_venta', type: 'decimal', precision:10, scale: 2})
    precio_venta: number;

    @Column({name: 'eliminado', type: 'boolean', nullable:false, default: false})
    eliminado: boolean;

    @Column({name: 'fecha_venta', type: 'timestamp', nullable: true})
    fecha_venta: Date | null;

    //relacion N - 1 entre Articulo y Categoria.
    @ManyToOne(
        () => Categoria, categoria => categoria.articulos, {nullable: false}
    )
    //fk que apunta a la entidad 'categoria'
    @JoinColumn({name: 'id_categoria'})
    categoria: Categoria;
}
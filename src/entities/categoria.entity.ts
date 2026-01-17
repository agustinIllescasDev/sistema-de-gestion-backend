import {Entity, PrimaryGeneratedColumn, Column, OneToMany} from "typeorm" 
import {Articulo} from 'src/entities/articulo.entity'
@Entity('categorias') 
export class Categoria { 

    @PrimaryGeneratedColumn({name: 'id_categoria'}) 
    id_categoria: number; 

    @Column({name: 'nombre' ,type: 'varchar', length: 50, nullable: false, unique:true}) 
    nombre: string; 

    @OneToMany(
        () => Articulo, articulo => articulo.categoria
    )
    articulos: Articulo[];
}
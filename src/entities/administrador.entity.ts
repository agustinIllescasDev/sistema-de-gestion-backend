import {Entity, PrimaryGeneratedColumn, Column} from "typeorm" 

@Entity('administradores')
export class Administrador {
    @PrimaryGeneratedColumn({name: 'id_administrador'})
    id_administrador: number

    @Column({name: 'nombre', type:'varchar',length:20, nullable: false})
    nombre: string;

    @Column({name: 'mail', type:'varchar',length:100, nullable: false, unique:true})
    mail: string;

    @Column({name: 'password', type:'varchar',length:255, nullable: false})
    password: string;
}
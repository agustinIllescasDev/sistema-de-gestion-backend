//categorias.service.ts

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import{Categoria} from 'src/entities/categoria.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CategoriasService {

    //Inyectamos el repository
    constructor(
        @InjectRepository(Categoria)
        private readonly categoriaRepository: Repository<Categoria>){}

    
    //Validar que el nombre de la categoria no esté vacío.
    private validarNombre(nombre: string){
        if(!nombre || nombre.trim().length === 0 ){
            throw new BadRequestException("El nombre de la categoría no puede estar vacío.");
        }
    }

    //Validar que no haya categorias repetidas.

    private async validarCategoriaUnica(nombre: string){
        //Se busca coincidencias en la base de datos
        const existente = await this.categoriaRepository.findOne({
            where: {nombre}
        });

        //Si hay coincidencias se lanza una excepcion.
        if (existente){
            throw new BadRequestException('Ya existe una categoria con ese nombre');
        }
    }

    //CRUD:

    //Crear categoria.
    async crearCategoria(nombre:string): Promise<Categoria>{

        //Verificar que el nombre sea valido
        this.validarNombre(nombre);

        //Esperamos a que la funcion asincrona retorne.
        await this.validarCategoriaUnica(nombre)

        //Creamos una instancia de la entidad categoria y le pasamos el nombre que tendra.
        const categoria = this.categoriaRepository.create({ 
            nombre
        });

        //Retornamos la promesa que representa la categoria creada si se resuelve.
        return this.categoriaRepository.save(categoria);
    }

    //Obtener todas las categorias
    async obtenerCategorias():Promise<Categoria[]>{
        return this.categoriaRepository.find();
    }

    //Obtener una categoria por id
    async obtenerCategoriaPorId(id:number):Promise<Categoria>{

        //Buscamos la categoria en la DB pasandole el id.
        const categoria = await this.categoriaRepository.findOne({
            where: {id_categoria:id},
        });

        //Manejo de error en caso de que no exista la categoria.
        if(!categoria){
            throw new NotFoundException('Categoria no encontrada');
        }

        //Retornamos la promesa que representa la categoria encontrada.
        return categoria;
    }

    //Actualizar categoria.
    async actualizarCategoria(id: number, nombre:string):Promise<Categoria>{

        //Verificar que el nombre contenga algun valor
        this.validarNombre(nombre)

        //Esperamos a que el metodo retorne la promesa y esta se resuelva. 
        const categoria = await this.obtenerCategoriaPorId(id);

        //Buscamos la categoria por su nombre en la BD  
        const existente = await this.categoriaRepository.findOne({
            where: {nombre}
        });

        //No permitir que existan 2 categorias con el mismo nombre. 
        if (existente && existente.id_categoria !== categoria.id_categoria){
            throw new BadRequestException('Ya existe una categoria con ese nombre.');
        }

        //Asignar el nuevo valor del nombre de la categoria.
        categoria.nombre = nombre;

        //Retornamos la promesa que represnta la categoria actualizada.
        return this.categoriaRepository.save(categoria);
    }

    async eliminarCategoria(id:number):Promise<void>{

        // Busca una categoria por su ID e incluye sus articulos asociados.
        const categoria = await this.categoriaRepository.findOne({
            where: {id_categoria:id},
            relations: ['articulos'],
        })
        
        //Manejo de error en caso de no encontrar categorias con ese id.
        if (!categoria){
            throw new BadRequestException('Categoria no encontrada.');
        }

        //Si encuentra al menos un articulo asociado a la categoria, no se permite la eliminacion.
        if (categoria.articulos.length > 0){
            throw new BadRequestException('No se puede eliminar una categoria que tenga articulos asociados.');
        }

        //Retornamos la promesa que representa la eliminacion exitosa cuando se resuelva.
        await this.categoriaRepository.remove(categoria);
    }
}
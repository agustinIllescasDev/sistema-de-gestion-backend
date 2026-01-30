//articulos.service.ts


import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {Estado} from 'src/common/enums/estado-articulo.enum';
import { Articulo } from 'src/entities/articulo.entity';
import { Categoria } from 'src/entities/categoria.entity';
import { Repository } from 'typeorm';
import {CreateArticuloDto} from 'src/modules/articulos/dto/create-articulo.dto'
import { UpdateArticuloDto } from './dto/update-articulo.dto';

@Injectable()
export class ArticulosService {


    //Inyectar repositorios de typeorm
    constructor(
        @InjectRepository(Articulo)
        private readonly articuloRepository: Repository<Articulo>,
        @InjectRepository(Categoria)
        private readonly categoriaRepository: Repository<Categoria>,

        //private readonly reportesService: ReportesService
    ){}

    //array con los valores del ENUM.
    private readonly estadosPermitidos = [Estado.DISPONIBLE,Estado.VENDIDO];

    //Validacion de estados permitidos.
    validarEstado (estado: Estado) {
        if (!this.estadosPermitidos.includes(estado)){
            throw new BadRequestException(
                `Estado inválido. Estados permitidos: ${this.estadosPermitidos.join(', ')}`
            )
        }
    }

    //validacion de las transiciones del estado
    validarTransicion(estadoActual:Estado,estadoNuevo:Estado){

        //validar que los estados existan.
        //Si no existe, lanza una excepcion, y si existe, la funcion no retorna nada y continua la ejecucion.
        this.validarEstado(estadoActual)
        this.validarEstado(estadoNuevo)


        //No permitir que el estado "cambie" su mismo valor.
        if(estadoActual === estadoNuevo){
            throw new BadRequestException(
                `El articulo ya se encuentra en el estado ${estadoActual}`);
        }

        //No permitir que un artiículo vendido vuelva a estar disponible.
        if(estadoActual === Estado.VENDIDO && estadoNuevo === Estado.DISPONIBLE){
            throw new BadRequestException('No se puede volver a DISPONIBLE un articulo ya vendido');
        }

    }

    //Validar que el artículo no esté eliminado antes intentar operaciones sobre él. 
    validarNoEliminado(articulo: Articulo){
        if(articulo.deletedAt){
            throw new BadRequestException('No se pueden realizar operaciones sobre un artículo eliminado');
        }
    }


    //Validar que el precio base sea mayor a 0.
    validarPrecioBase(precioBase:number){
        if(precioBase<=0){
            throw new BadRequestException('El precio base debe ser mayor a 0');
        } 
    }


    //Validar que exista un porcentaje.
    validarPorcentaje(porcentaje_ganancia: number){
        if(porcentaje_ganancia == null || porcentaje_ganancia === undefined){
            throw new BadRequestException('El porcentaje es obligatorio');
        }

        
        if (porcentaje_ganancia <= 0) {
            throw new BadRequestException('El porcentaje debe ser mayor a 0');
        }

    }

    //Cálculo del precio de venta del artículo.
    calcularPrecioVenta(precioBase: number, porcentaje_ganancia: number): number {
        this.validarPrecioBase(precioBase);
        this.validarPorcentaje(porcentaje_ganancia)
        return precioBase + (precioBase* porcentaje_ganancia/100)
    } 


    //Este metodo solo construye el objeto del articulo, el cual en el crud sera guardado.
    crearArticulo(data:{
        nombre: string,
        descripcion?: string,
        imagen?: string,
        precio_base: number,
        porcentaje_ganancia: number,
        categoria: Categoria,
    }): Articulo{
        const articulo = new Articulo()

        //Asignacion de valores
        articulo.nombre = data.nombre;
        articulo.descripcion = data.descripcion ?? null;
        articulo.imagen = data.imagen ?? null;
        articulo.precio_base = data.precio_base;
        articulo.porcentaje_ganancia = data.porcentaje_ganancia;
        articulo.precio_venta = this.calcularPrecioVenta(data.precio_base,data.porcentaje_ganancia)
        articulo.estado = Estado.DISPONIBLE;
        articulo.fecha_venta = null;
        articulo.categoria = data.categoria;

        return articulo;
    }

    //Editar un articulo (solo retorna el objeto, no persiste los datos).
    editarArticulo(
        articulo:Articulo,
        data: {
            nombre?: string;
            descripcion?: string;
            imagen?: string;
            precio_base?: number;
            porcentaje_ganancia?: number;
            categoria?: Categoria;
        }):Articulo{
        
        //Validar que no este eliminado antes de hacer operaciones sobre el articulo.
        this.validarNoEliminado(articulo);

        //Edicion de nombre.
        if (data.nombre !== undefined){
            articulo.nombre = data.nombre;
        }

        //Edicion de descripcion.
        if(data.descripcion !== undefined){
            articulo.descripcion = data.descripcion;
        }

        //Edicion de imagen.
        if (data.imagen !== undefined){
            articulo.imagen = data.imagen;
        }

        //Edicion de categoria.
        if (data.categoria !== undefined){
            articulo.categoria = data.categoria;
        }

        //variable para saber si corresponde recalcular precio_venta.
        let recalcularPrecio = false;

        //Edicion de precio_base.
        if (data.precio_base !== undefined){
            this.validarPrecioBase(data.precio_base);
            articulo.precio_base = data.precio_base;
            recalcularPrecio = true;
        }

        //Edicion de porcentaje_ganancia.
        if (data.porcentaje_ganancia !== undefined){
            this.validarPorcentaje(data.porcentaje_ganancia);
            articulo.porcentaje_ganancia = data.porcentaje_ganancia;
            recalcularPrecio = true;
        }

        //recalcular precio_venta.
        if (recalcularPrecio){
            articulo.precio_venta = this.calcularPrecioVenta(articulo.precio_base,articulo.porcentaje_ganancia);
        }

        //Retornamos el objeto de tipo articulo editado.
        return articulo;
    }

    marcarComoVendido(
        articulo: Articulo,
        nuevoEstado: Estado
    ):Articulo {
         //Validar que no este eliminado antes de hacer operaciones sobre el articulo.
        this.validarNoEliminado(articulo);

        //Validar la transicion del estado.
        this.validarTransicion(articulo.estado, nuevoEstado);

        //Aplicar cambio de estado.
        articulo.estado = nuevoEstado;

        //Regla de negocio (Un articulo solo tiene fecha de venta una vez que fue vendido).
        if (nuevoEstado === Estado.VENDIDO){
            articulo.fecha_venta = new Date();
        }
            
        return articulo;

    }
 
    
    //CRUD

    //Create
    async crear(dto: CreateArticuloDto, file?: string): Promise<Articulo>{

        //Recuperamos la categoria de la bd que tendrá el articulo una vez guardado.
        const categoria = await this.categoriaRepository.findOneBy({
            id_categoria: dto.id_categoria,
        })

        //Si no se encuentra lanzamos una excepcion.
        if(!categoria){
            throw new BadRequestException('Categoría inexistente.');
        }
        
        //Construimos el objeto del articulo pasando la informacion del DTO al metodo crearArticulo().
        const articulo = this.crearArticulo({
            nombre: dto.nombre,
            descripcion: dto.descripcion,
            imagen: file,
            precio_base: dto.precio_base,
            porcentaje_ganancia: dto.porcentaje_ganancia,
            //foreign key para la categoria
            categoria
        }
        );

        //guardamos el registro (objeto) en la base de datos
        return this.articuloRepository.save(articulo);
    }

    //Get
    async obtenerTodos(estado? :Estado , pagina: number = 1, limite: number = 10){

        const salto = (pagina-1) * limite; //importante para no mostrar siempre los mismos registros, se muestran resultados desde el valor de esta variable en adelante.

        const [articulos,total] = await this.articuloRepository.findAndCount({
            where: estado ? {estado} : {}, //Si se recibe el estado en la url, se aplica el filtro por estado. Si no, se traen todos los articulos (que no esten eliminados).
            take: limite, 
            skip: salto,
            relations: ['categoria'],
            order: {id_articulo: 'DESC'} // 'DESC' para descendente (más nuevos primero)
        })

        return {
            data: articulos, //Se retornan los articulos aplicando la paginacion.
            total, //Retornamos la cantidad total de articulos para que el frontend sepa cuantos estamos mostrando y cuantos falta mostrar.
            pagina, //Numero de pagina.
            limite //Cantidad de elementos por pagina.
        }
    }


    //Get (id)
    async obtenerArticuloPorId(id:number){
        
        const articulo = await this.articuloRepository.findOne({
            where: {id_articulo: id},
            relations: ['categoria'],
    })

        if(!articulo){
                throw new NotFoundException('Articulo no encontrado');
        }

        return articulo
    }

    //Update
    async actualizarArticulo(dto:UpdateArticuloDto, id:number){
        //Buscamos el articulo en la base de datos.
        const articulo = await this.obtenerArticuloPorId(id);

        let categoria;

        //Si se recibe el id categoria desde el dto, la recuperamos desde la base de datos.
        if (dto.id_categoria){
            categoria = await this.categoriaRepository.findOneBy({
                id_categoria: dto.id_categoria
            });

            //Si no se encuentra la categoria, se lanza un error.
            if(!categoria){
                throw new NotFoundException('Categoria no encontrada');
            }
        }

        //Construimos el objeto del articulo con los datos actualizados.
        const articuloEditado = this.editarArticulo(articulo, {
            nombre: dto.nombre,
            descripcion: dto.descripcion,
            imagen: dto.imagen,
            precio_base: dto.precio_base,
            porcentaje_ganancia: dto.porcentaje_ganancia,
            categoria
        })

        //Guardamos el registro en la base de datos.
        return await this.articuloRepository.save(articuloEditado);
    }


    // Soft Delete
    async eliminarArticulo (id: number){

        //Buscamos el articulo a eliminar
        const articulo = await this.obtenerArticuloPorId(id);

        //Validamos que aun no esté eliminado el articulo.
        this.validarNoEliminado(articulo)

        //Evitar eliminar articulos ya vendidos.
        if (articulo.estado === Estado.VENDIDO) {
            throw new BadRequestException('No se puede eliminar un artículo vendido');
        }

        //Aplicamos soft delete.
        await this.articuloRepository.softDelete(id);

        //Retornamos mensage de exito en la operacion.
        return { message: `Articulo ${id} eliminado correctamente` };
    }


async restoreArticulo(id: number) {
    //Buscamos el artículo incluyendo los eliminados (si no, find no lo encontrará)
    const articulo = await this.articuloRepository.findOne({
        where: { id_articulo: id },
        withDeleted: true, // Crucial para encontrar registros con deletedAt
    });

    if (!articulo) {
        throw new NotFoundException('Artículo no encontrado');
    }

    //Validar que realmente esté eliminado
    if (!articulo.deletedAt) {
        throw new BadRequestException('El artículo no está eliminado');
    }

    //Aplicar el restore (esto limpia la fecha en deletedAt)
    await this.articuloRepository.restore(id);

    return { message: `Articulo ${id} restaurado correctamente` };
}

    //Vender articulo
    async venderArticulo(id:number){
        const articulo = await this.obtenerArticuloPorId(id);
        
        if (articulo.estado === Estado.VENDIDO) {
            throw new BadRequestException('No se puede vender un artículo ya vendido');
        }

        const articuloVendido = this.marcarComoVendido(articulo, Estado.VENDIDO);

        return this.articuloRepository.save(articuloVendido);
    }


    async obtenerTodosSinPaginacion(estadoArticulo: Estado){
       const articulos = await this.articuloRepository.find({
        where: {estado : estadoArticulo},
        relations: ['categoria']
       })
       return articulos
    }

    async obtenerDatosReporteStock(){
        const articulos = await this.obtenerTodosSinPaginacion(Estado.DISPONIBLE);
        if(!articulos || articulos.length === 0){
            throw new BadRequestException('No se encontraron resultados');
        }
        
        // Configuramos el formateador
        const formateador = new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 2
        });

        return articulos.map(articulo => [
            articulo.id_articulo,
            articulo.nombre,
            articulo.categoria?.nombre || 'Sin categoria',
            formateador.format(articulo.precio_base),
            formateador.format(articulo.precio_venta)])
    }


    async obtenerDatosReporteVentas(){
        const articulos = await this.obtenerTodosSinPaginacion(Estado.VENDIDO);
        if(!articulos || articulos.length === 0){
            throw new BadRequestException('No se encontraron resultados');
        }
        
        // Configuramos el formateador
        const formateador = new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 2
        });

        //Recorremos el array de articulos para obtener la informacion necesaria de cada registro.
        return articulos.map(articulo => {
            //Calculo de ganancia total.
            const gananciaTotal = Number(articulo.precio_venta) - Number(articulo.precio_base);

            //La libreria pdfkit debe recibir un array de strings para dibujarlos.
            return [
                articulo.id_articulo.toString(),
                articulo.nombre,
                articulo.categoria?.nombre || 'Sin categoria',
                //Convertir fecha a string legible para el pdf
                articulo.fecha_venta ? new Date(articulo.fecha_venta).toLocaleDateString('es-AR'): 'N/A',
                formateador.format(articulo.precio_base),
                formateador.format(articulo.precio_venta),
                //Convertir el porcentaje a un string
                `${articulo.porcentaje_ganancia} %`,
                formateador.format(gananciaTotal)
            ];
            
        });
    }


    async subirImagen(imagen: any){

    }
}

import { Injectable, BadRequestException } from '@nestjs/common';
import {Estado} from 'src/common/enums/estado-articulo.enum';
import { Articulo } from 'src/entities/articulo.entity';
import { Categoria } from 'src/entities/categoria.entity';

@Injectable()
export class ArticulosService {
    //Creacion del array con los valores del ENUM.
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
        if(articulo.eliminado){
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

    crearArticulo(data:{
        nombre: string,
        descripcion?: string,
        imagen?: string,
        precio_base: number,
        porcentaje_ganancia: number,
        categoria: Categoria,
    }): Articulo{
        const articulo = new Articulo()

        //Asignacion de valores enviados por el cliente
        articulo.nombre = data.nombre;

        if(data.descripcion !== undefined){
            articulo.descripcion = data.descripcion ?? null;
        }
        
        if(data.imagen !== undefined){
            articulo.imagen = data.imagen ?? null;
        }
        
        articulo.precio_base = data.precio_base;
        articulo.porcentaje_ganancia = data.porcentaje_ganancia;
        
        //Asignacion de valores de dominio 
        articulo.precio_venta = this.calcularPrecioVenta(data.precio_base,data.porcentaje_ganancia)
        articulo.estado = Estado.DISPONIBLE;
        articulo.eliminado = false;
        articulo.fecha_venta = null;
        articulo.categoria = data.categoria;

        return articulo;
    }

    //Metodo para editar un articulo.
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

        //Retornamos el articulo editado.
        return articulo;
    }

    venderArticulo(
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
        
    
}
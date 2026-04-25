//articulos.service.ts

import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Estado } from 'src/common/enums/estado-articulo.enum';
import { Articulo } from 'src/entities/articulo.entity';
import { Categoria } from 'src/entities/categoria.entity';
import { Repository, ILike } from 'typeorm';
import { CreateArticuloDto } from 'src/modules/articulos/dto/create-articulo.dto';
import { UpdateArticuloDto } from './dto/update-articulo.dto';
import { join } from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

@Injectable()
export class ArticulosService {
  //Inyectar repositorios de typeorm
  constructor(
    @InjectRepository(Articulo)
    private readonly articuloRepository: Repository<Articulo>,
    @InjectRepository(Categoria)
    private readonly categoriaRepository: Repository<Categoria>,

    //private readonly reportesService: ReportesService
  ) {}

  //array con los valores del ENUM.
  private readonly estadosPermitidos = [Estado.DISPONIBLE, Estado.VENDIDO];

  //Validacion de estados permitidos.
  validarEstado(estado: Estado) {
    if (!this.estadosPermitidos.includes(estado)) {
      throw new BadRequestException(
        `Estado inválido. Estados permitidos: ${this.estadosPermitidos.join(', ')}`,
      );
    }
  }

  //validacion de las transiciones del estado
  validarTransicion(estadoActual: Estado, estadoNuevo: Estado) {
    //validar que los estados existan.
    //Si no existe, lanza una excepcion, y si existe, la funcion no retorna nada y continua la ejecucion.
    this.validarEstado(estadoActual);
    this.validarEstado(estadoNuevo);

    //No permitir que el estado "cambie" su mismo valor.
    if (estadoActual === estadoNuevo) {
      throw new BadRequestException(
        `El articulo ya se encuentra en el estado ${estadoActual}`,
      );
    }
  }

  //Validar que el precio base sea mayor a 0.
  validarPrecioBase(precioBase: number) {
    if (precioBase <= 0) {
      throw new BadRequestException('El precio base debe ser mayor a 0');
    }
  }

  //Validar que exista un porcentaje.
  validarPorcentaje(porcentaje_ganancia: number) {
    if (porcentaje_ganancia == null || porcentaje_ganancia === undefined) {
      throw new BadRequestException('El porcentaje es obligatorio');
    }

    if (porcentaje_ganancia <= 0) {
      throw new BadRequestException('El porcentaje debe ser mayor a 0');
    }
  }

  //Cálculo del precio de venta del artículo.
  calcularPrecioVenta(precioBase: number, porcentaje_ganancia: number): number {
    this.validarPrecioBase(precioBase);
    this.validarPorcentaje(porcentaje_ganancia);
    return precioBase + (precioBase * porcentaje_ganancia) / 100;
  }

  //Este metodo solo construye el objeto del articulo, el cual en el crud sera guardado.
  crearArticulo(data: {
    nombre: string;
    descripcion?: string;
    imagen?: string;
    precio_base: number;
    porcentaje_ganancia: number;
    categoria: Categoria;
  }): Articulo {
    const articulo = new Articulo();

    //Asignacion de valores
    articulo.nombre = data.nombre;
    articulo.descripcion = data.descripcion ?? null;
    articulo.imagen = data.imagen ?? null;
    articulo.precio_base = data.precio_base;
    articulo.porcentaje_ganancia = data.porcentaje_ganancia;
    articulo.precio_venta = this.calcularPrecioVenta(
      data.precio_base,
      data.porcentaje_ganancia,
    );
    articulo.estado = Estado.DISPONIBLE;
    articulo.fecha_venta = null;
    articulo.categoria = data.categoria;

    return articulo;
  }

  //Editar un articulo (solo retorna el objeto, no persiste los datos).
  editarArticulo(
    articulo: Articulo,
    data: {
      nombre?: string;
      descripcion?: string;
      imagen?: string;
      precio_base?: number;
      porcentaje_ganancia?: number;
      categoria?: Categoria;
    },
  ): Articulo {
    //Edicion de nombre.
    if (data.nombre !== undefined) {
      articulo.nombre = data.nombre;
    }

    //Edicion de descripcion.
    if (data.descripcion !== undefined) {
      articulo.descripcion = data.descripcion;
    }

    //Edicion de imagen.
    if (data.imagen !== undefined) {
      articulo.imagen = data.imagen;
    }

    //Edicion de categoria.
    if (data.categoria !== undefined) {
      articulo.categoria = data.categoria;
    }

    //variable para saber si corresponde recalcular precio_venta.
    let recalcularPrecio = false;

    //Edicion de precio_base.
    if (data.precio_base !== undefined) {
      this.validarPrecioBase(data.precio_base);
      articulo.precio_base = data.precio_base;
      recalcularPrecio = true;
    }

    //Edicion de porcentaje_ganancia.
    if (data.porcentaje_ganancia !== undefined) {
      this.validarPorcentaje(data.porcentaje_ganancia);
      articulo.porcentaje_ganancia = data.porcentaje_ganancia;
      recalcularPrecio = true;
    }

    //recalcular precio_venta.
    if (recalcularPrecio) {
      articulo.precio_venta = this.calcularPrecioVenta(
        articulo.precio_base,
        articulo.porcentaje_ganancia,
      );
    }

    //Retornamos el objeto de tipo articulo editado.
    return articulo;
  }

  marcarComoVendido(articulo: Articulo, nuevoEstado: Estado): Articulo {
    //Validar la transicion del estado.
    this.validarTransicion(articulo.estado, nuevoEstado);

    //Aplicar cambio de estado.
    articulo.estado = nuevoEstado;

    //Regla de negocio (Un articulo solo tiene fecha de venta una vez que fue vendido).
    if (nuevoEstado === Estado.VENDIDO) {
      articulo.fecha_venta = new Date();
    }

    return articulo;
  }

  // Agregá este método en tu ArticulosService
  async optimizarImagen(file: Express.Multer.File): Promise<string> {
    const nombreArchivo = `${uuidv4()}.webp`;
    const pathDestino = join(
      process.cwd(),
      'uploads',
      'articulos',
      nombreArchivo,
    );

    // Verificamos que la carpeta exista (útil para el primer despliegue en Docker)
    const directorio = join(process.cwd(), 'uploads', 'articulos');
    if (!fs.existsSync(directorio)) {
      fs.mkdirSync(directorio, { recursive: true });
    }

    // Procesamiento con Sharp
    await sharp(file.buffer)
      .resize(800) // Redimensionamos a 800px de ancho (suficiente para usados)
      .webp({ quality: 80 }) // Convertimos a WebP (ahorro de ~80% de peso)
      .toFile(pathDestino);

    return nombreArchivo;
  }

  //CRUD

  //Create
  async crear(
    dto: CreateArticuloDto,
    file?: Express.Multer.File,
  ): Promise<Articulo> {
    //Recuperamos la categoria de la bd que tendrá el articulo una vez guardado.
    const categoria = await this.categoriaRepository.findOneBy({
      id_categoria: dto.id_categoria,
    });

    //Si no se encuentra lanzamos una excepcion.
    if (!categoria) {
      throw new BadRequestException('Categoría inexistente.');
    }

    let nombreImagen: string | undefined = undefined;
    if (file) {
      // Aquí llamarás a la función de Sharp que devuelve el string del nombre
      nombreImagen = await this.optimizarImagen(file);
    }
    //Construimos el objeto del articulo pasando la informacion del DTO al metodo crearArticulo().
    const articulo = this.crearArticulo({
      nombre: dto.nombre,
      descripcion: dto.descripcion,
      imagen: nombreImagen,
      precio_base: dto.precio_base,
      porcentaje_ganancia: dto.porcentaje_ganancia,
      //foreign key para la categoria
      categoria,
    });

    //guardamos el registro (objeto) en la base de datos
    return this.articuloRepository.save(articulo);
  }

  //Get
  async obtenerTodos(
    estado?: Estado,
    search?: string,
    pagina: number = 1,
    limite: number = 20,
    categoria?: number,
  ) {
    const salto = (pagina - 1) * limite; //importante para no mostrar siempre los mismos registros, se muestran resultados desde el valor de esta variable en adelante.

    //Creamos la base de los filtros (los que siempre deben cumplirse: estado y categoria)
    const baseFilter: any = {};
    if (estado) baseFilter.estado = estado;
    if (categoria) baseFilter.categoria = { id_categoria: categoria };

    //Construir objeto de condiciones 'where'
    let whereConditions: any | any[];

    if (search) {
      const cleanSearch = search.trim(); // 1. Limpiamos espacios

      if (cleanSearch === '') {
        // 2. Si después de limpiar quedó vacío, ignoramos la búsqueda
        whereConditions = baseFilter;
      } else {
        // 3. Si tiene texto real, usamos cleanSearch para filtrar
        whereConditions = [
          { ...baseFilter, nombre: ILike(`%${cleanSearch}%`) },
        ];

        const searchNumber = Number(cleanSearch);
        if (!isNaN(searchNumber)) {
          whereConditions.push({ ...baseFilter, id_articulo: searchNumber });
        }
      }
    } else {
      whereConditions = baseFilter;
    }

    const [articulos, total] = await this.articuloRepository.findAndCount({
      where: whereConditions,
      take: limite,
      skip: salto,
      relations: ['categoria'],
      order: { id_articulo: 'DESC' }, // 'DESC' para descendente (más nuevos primero)
    });

    return {
      data: articulos, //Se retornan los articulos aplicando la paginacion.
      total, //Retornamos la cantidad total de articulos para que el frontend sepa cuantos estamos mostrando y cuantos falta mostrar.
      pagina, //Numero de pagina.
      limite, //Cantidad de elementos por pagina.
    };
  }

  //Get (id)
  async obtenerArticuloPorId(id: number) {
    const articulo = await this.articuloRepository.findOne({
      where: { id_articulo: id },
      relations: ['categoria'],
    });

    if (!articulo) {
      throw new NotFoundException('Articulo no encontrado');
    }

    return articulo;
  }

  //Update
  async actualizarArticulo(
    dto: UpdateArticuloDto,
    id: number,
    file?: Express.Multer.File,
  ) {
    //Buscamos el articulo en la base de datos.
    const articulo = await this.obtenerArticuloPorId(id);

    let categoria;

    //Si se recibe el id categoria desde el dto, recuperamos la misma desde la base de datos.
    if (dto.id_categoria) {
      categoria = await this.categoriaRepository.findOneBy({
        id_categoria: dto.id_categoria,
      });

      //Si no se encuentra la categoria, se lanza un error.
      if (!categoria) {
        throw new NotFoundException('Categoria no encontrada');
      }
    }

    //Gestionar la actualizacion de imagen
    if (file) {
      // CASO 1: Viene un archivo nuevo
      if (articulo.imagen) {
        this.borrarArchivoFisico(articulo.imagen);
      }
      articulo.imagen = await this.optimizarImagen(file);
    } else if (
      dto.imagen === null ||
      dto.imagen === '' ||
      dto.imagen === 'null'
    ) {
      // CASO 2: El frontend envía explícitamente que la imagen debe ser nula
      // (Esto sucede cuando el usuario toca la cruz roja)
      if (articulo.imagen) {
        this.borrarArchivoFisico(articulo.imagen);
      }
      articulo.imagen = null;
    }

    //Construimos el objeto del articulo con los datos actualizados.
    const articuloEditado = this.editarArticulo(articulo, {
      nombre: dto.nombre,
      descripcion: dto.descripcion,
      imagen: articulo.imagen ?? undefined,
      precio_base: dto.precio_base,
      porcentaje_ganancia: dto.porcentaje_ganancia,
      categoria,
    });

    //Guardamos el registro en la base de datos.
    return await this.articuloRepository.save(articuloEditado);
  }

  //Delete
  async eliminarArticulo(id: number) {
    //Buscamos el articulo a eliminar
    const articulo = await this.obtenerArticuloPorId(id);

    //Validamos que el articulo exista en la base de datos
    if (!articulo) {
      throw new NotFoundException('Articulo no encontrado');
    }

    //Evitar eliminar articulos ya vendidos.
    if (articulo.estado === Estado.VENDIDO) {
      throw new BadRequestException('No se puede eliminar un artículo vendido');
    }

    //borrar archivo fisico de la imagen
    if (articulo.imagen) {
      this.borrarArchivoFisico(articulo.imagen);
      articulo.imagen = null;
      await this.articuloRepository.save(articulo);
    }

    //Aplicamos soft delete (Asigna la fecha actual al campo 'deletedAt'. Con Esto, typeorm detecta que se trata de un soft delete).
    await this.articuloRepository.delete(id);

    //Si todo salio bien, retornamos un mensaje de exito en la operacion.
    return {
      message: `Articulo "${articulo.id_articulo}" eliminado correctamente`,
    };
  }

  //Vender articulo
  async venderArticulo(id: number) {
    const articulo = await this.obtenerArticuloPorId(id);

    if (articulo.estado === Estado.VENDIDO) {
      throw new BadRequestException(
        'No se puede vender un artículo ya vendido',
      );
    }

    const articuloVendido = this.marcarComoVendido(articulo, Estado.VENDIDO);

    return this.articuloRepository.save(articuloVendido);
  }

  //Anular Venta (Volver a DISPONIBLE un articulo vendido, con fecha_venta en null)
  async anularVenta(id: number) {
    const articulo = await this.obtenerArticuloPorId(id);

    // Validamos que realmente esté vendido
    if (articulo.estado !== Estado.VENDIDO) {
      throw new BadRequestException(
        'Solo se pueden anular artículos que ya fueron vendidos.',
      );
    }

    // Resetear a estado inicial
    articulo.estado = Estado.DISPONIBLE;
    articulo.fecha_venta = null;

    return await this.articuloRepository.save(articulo);
  }

  async obtenerTodosSinPaginacion(estadoArticulo: Estado) {
    const articulos = await this.articuloRepository.find({
      where: { estado: estadoArticulo },
      relations: ['categoria'],
    });
    return articulos;
  }

  async obtenerDatosReporteStock() {
    const articulos = await this.obtenerTodosSinPaginacion(Estado.DISPONIBLE);
    if (!articulos || articulos.length === 0) {
      throw new BadRequestException('No se encontraron resultados');
    }

    // Configuramos el formateador
    const formateador = new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
    });

    return articulos.map((articulo) => [
      articulo.id_articulo,
      articulo.nombre,
      articulo.categoria?.nombre || 'Sin categoria',
      formateador.format(articulo.precio_base),
      formateador.format(articulo.precio_venta),
    ]);
  }

  async obtenerDatosReporteVentas() {
    const articulos = await this.obtenerTodosSinPaginacion(Estado.VENDIDO);
    if (!articulos || articulos.length === 0) {
      throw new BadRequestException('No se encontraron resultados');
    }

    // Configuramos el formateador
    const formateador = new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
    });

    //Recorremos el array de articulos para obtener la informacion necesaria de cada registro.
    return articulos.map((articulo) => {
      //Calculo de ganancia total.
      const gananciaTotal =
        Number(articulo.precio_venta) - Number(articulo.precio_base);

      //La libreria pdfkit debe recibir un array de strings para dibujarlos.
      return [
        articulo.id_articulo.toString(),
        articulo.nombre,
        articulo.categoria?.nombre || 'Sin categoria',
        //Convertir fecha a string legible para el pdf
        articulo.fecha_venta
          ? new Date(articulo.fecha_venta).toLocaleDateString('es-AR')
          : 'N/A',
        formateador.format(articulo.precio_base),
        formateador.format(articulo.precio_venta),
        //Convertir el porcentaje a un string
        `${articulo.porcentaje_ganancia} %`,
        formateador.format(gananciaTotal),
      ];
    });
  }

  private borrarArchivoFisico(nombreImagen: string) {
    if (!nombreImagen) return; // Si no hay imagen, no hacemos nada

    const path = join(process.cwd(), 'uploads', 'articulos', nombreImagen);

    if (fs.existsSync(path)) {
      try {
        fs.unlinkSync(path);
        console.log(`Archivo borrado: ${nombreImagen}`);
      } catch (error) {
        console.error(`Error al borrar el archivo ${nombreImagen}:`, error);
      }
    }
  }
}

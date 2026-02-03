# 📦 Sistema de Gestión - Compra/Venta de Artículos

Backend profesional desarrollado con **NestJS** y **PostgreSQL** para la administración de stock, categorías y reportes de artículos usados.

## 🚀 Características
* 🔐 **Seguridad:** Autenticación JWT con protección de rutas mediante Guards.
* 🖼️ **Media:** Gestión de imágenes de artículos mediante Multer.
* 📑 **Paginación:** Consultas optimizadas con metadatos de paginado y filtros por estado.
* 📂 **Arquitectura:** Estructura modular escalable y limpia.
* 📖 **Documentación:** API interactiva documentada con Swagger UI.

---

## 🔧 Configuración Inicial

### 1. Instalación de dependencias
pnpm install

### 2. Infraestructura (Docker)
Levanta la base de datos PostgreSQL utilizando el archivo de configuración incluido:
docker-compose up -d

### 3. Ejecución del Proyecto
pnpm run start:dev

---

## 📖 Documentación de la API (Swagger)

Una vez que el servidor esté corriendo, accede a la documentación interactiva en:
🔗 **http://localhost:3000/api**

**Pasos para probar rutas protegidas:**
1. Haz login desde el endpoint `POST /auth/login`.
2. Copia el `access_token` recibido.
3. Haz clic en el botón **Authorize** arriba a la derecha en Swagger, pega el token y confirma.

---

## 🔑 Variables de Entorno

| Variable | Descripción | Ejemplo |
| :--- | :--- | :--- |
| **DB_HOST** | Host de PostgreSQL | localhost |
| **DB_PORT** | Puerto de PostgreSQL | 5432 |
| **DB_NAME** | Nombre de la base de datos | sistema_gestion_db |
| **DB_USER** | Usuario de la base de datos | lonerDev |
| **DB_PASSWORD** | Password del usuario | **** |
| **JWT_SECRET** | Clave para tokens JWT | tu_clave_secreta |
| **NODE_ENV** | Entorno de ejecución | development |

---

## 📁 Estructura del Proyecto
* **src/modules**: Lógica de negocio (Artículos, Categorías, Auth, Reportes, Administradores).
* **src/common**: Recursos compartidos (Enums, Interfaces, Decoradores).
* **uploads/articulos**: Directorio local para almacenamiento de imágenes.

---

## 📜 Licencia
Este proyecto es de uso privado.
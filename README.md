# Tienda API

API REST construida con Node.js, Express y MySQL para la gestión de productos de una tienda.  
Incluye operaciones CRUD (crear, leer, actualizar y eliminar productos) y está lista para pruebas con Postman.

---

## Instalación

1. Clonar el repositorio:
   git clone https://github.com/joseeduc2005-cmd/tienda-api.git
   cd tienda-api

2. Instalar dependencias:
   npm install

3. Crear archivo .env en la raíz con la configuración de la base de datos:
   PORT=3000
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=api_user
   DB_PASSWORD=Clave_Segura123!
   DB_NAME=tienda_api

4. Ejecutar en modo desarrollo:
   npm run dev

5. O ejecutar en producción:
   npm start

---

## Endpoints principales

### Health Check
- GET /api/health → Verifica si el servicio está en ejecución.

### Productos
- GET /api/productos → Listar todos los productos.  
- GET /api/productos/:id → Obtener un producto por ID.  
- POST /api/productos → Crear un producto.  
- PUT /api/productos/:id → Actualizar un producto.  
- DELETE /api/productos/:id → Eliminar un producto.

Ejemplo para crear un producto (POST /api/productos):
{
  "nombre": "Mouse Gamer",
  "descripcion": "RGB, 7200 DPI",
  "sku": "SKU-MOU-001",
  "precio": 29.99,
  "stock": 50,
  "categoria_id": 1,
  "activo": true
}

---

## Tecnologías usadas
- Node.js
- Express
- MySQL
- Dotenv
- Nodemon
- Express Validator

---

## Autor
Repositorio creado por joseeduc2005-cmd.

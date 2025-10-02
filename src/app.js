const express = require('express');
require('dotenv').config();
require('./db'); // inicializa conexión a MySQL

// Importar router de productos
const productosRouter = require('./routes/productos.routes');

const app = express();
app.use(express.json());

// Ruta de prueba
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', ts: new Date().toISOString() });
});
// Ruta raíz de bienvenida
app.get('/', (_req, res) => {
  res.json({
    name: 'Tienda API',
    health: '/api/health',
    productos: '/api/productos'
  });
});

// Rutas de la API
app.use('/api/productos', productosRouter);

// 404 (si ninguna ruta anterior responde)
app.use((req, res) => res.status(404).json({ error: 'Recurso no encontrado' }));

// Middleware de errores
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Error interno' });
});

// Iniciar servidor
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`🚀 API en http://localhost:${port}`));


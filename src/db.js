const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Probar conexión al arrancar
(async () => {
  try {
    const c = await pool.getConnection();
    await c.ping();
    console.log('✅ Conectado a MySQL');
    c.release();
  } catch (e) {
    console.error('❌ Error de conexión MySQL:', e.message);
    process.exit(1);
  }
})();

module.exports = pool;

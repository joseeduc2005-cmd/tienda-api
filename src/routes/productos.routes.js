const { Router } = require('express');
const { validationResult } = require('express-validator');
const pool = require('../db');

const router = Router();

function checkValidations(req) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = new Error('Validación fallida');
    err.status = 400;
    err.details = errors.array();
    throw err;
  }
}

// --- LISTAR ---
router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.id, p.nombre, p.descripcion, p.sku, p.precio, p.stock,
             c.nombre AS categoria, p.activo, p.categoria_id
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      ORDER BY p.id DESC
    `);
    res.json(rows);
  } catch (err) { next(err); }
});

// --- OBTENER POR ID ---
router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.id, p.nombre, p.descripcion, p.sku, p.precio, p.stock,
              c.nombre AS categoria, p.activo, p.categoria_id
       FROM productos p
       LEFT JOIN categorias c ON p.categoria_id = c.id
       WHERE p.id = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'No encontrado' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// --- CREAR ---
router.post('/', async (req, res, next) => {
  try {
    const { nombre, descripcion = null, sku, precio, stock, categoria_id = null, activo = true } = req.body;

    // Validaciones básicas
    if (!nombre || !sku || precio === undefined || stock === undefined) {
      return res.status(400).json({ error: 'Campos requeridos: nombre, sku, precio, stock' });
    }

    // SKU único
    const [exist] = await pool.query('SELECT id FROM productos WHERE sku = ?', [sku]);
    if (exist.length) return res.status(409).json({ error: 'SKU ya registrado' });

    // Verificar categoría si viene
    if (categoria_id) {
      const [cat] = await pool.query('SELECT id FROM categorias WHERE id = ?', [categoria_id]);
      if (!cat.length) return res.status(400).json({ error: 'categoria_id inválido' });
    }

    const [result] = await pool.query(
      `INSERT INTO productos (nombre, descripcion, sku, precio, stock, categoria_id, activo)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nombre, descripcion, sku, Number(precio), Number(stock), categoria_id, activo ? 1 : 0]
    );

    res.status(201).json({
      id: result.insertId, nombre, descripcion, sku,
      precio: Number(precio), stock: Number(stock),
      categoria_id, activo: !!activo
    });
  } catch (err) { next(err); }
});

// --- ACTUALIZAR ---
router.put('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const [exists] = await pool.query('SELECT id FROM productos WHERE id = ?', [id]);
    if (!exists.length) return res.status(404).json({ error: 'No encontrado' });

    const m = req.body;
    const fields = [];
    const params = [];

    if (m.nombre !== undefined) { fields.push('nombre = ?'); params.push(m.nombre); }
    if (m.descripcion !== undefined) { fields.push('descripcion = ?'); params.push(m.descripcion); }
    if (m.sku !== undefined) {
      const [skuUsed] = await pool.query('SELECT id FROM productos WHERE sku = ? AND id <> ?', [m.sku, id]);
      if (skuUsed.length) return res.status(409).json({ error: 'SKU ya registrado por otro producto' });
      fields.push('sku = ?'); params.push(m.sku);
    }
    if (m.precio !== undefined) { fields.push('precio = ?'); params.push(Number(m.precio)); }
    if (m.stock !== undefined) { fields.push('stock = ?'); params.push(Number(m.stock)); }
    if (m.categoria_id !== undefined) {
      if (m.categoria_id === null) {
        fields.push('categoria_id = NULL');
      } else {
        const [cat] = await pool.query('SELECT id FROM categorias WHERE id = ?', [m.categoria_id]);
        if (!cat.length) return res.status(400).json({ error: 'categoria_id inválido' });
        fields.push('categoria_id = ?'); params.push(Number(m.categoria_id));
      }
    }
    if (m.activo !== undefined) { fields.push('activo = ?'); params.push(m.activo ? 1 : 0); }

    if (!fields.length) return res.status(400).json({ error: 'Nada para actualizar' });

    const sql = `UPDATE productos SET ${fields.join(', ')} WHERE id = ?`;
    params.push(id);
    await pool.query(sql, params);

    res.json({ ok: true });
  } catch (err) { next(err); }
});

// --- ELIMINAR ---
router.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const [exists] = await pool.query('SELECT id FROM productos WHERE id = ?', [id]);
    if (!exists.length) return res.status(404).json({ error: 'No encontrado' });
    await pool.query('DELETE FROM productos WHERE id = ?', [id]);
    res.status(204).send();
  } catch (err) { next(err); }
});

module.exports = router;

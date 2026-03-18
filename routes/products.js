const router = require('express').Router();
const db     = require('../db');
const { auth, adminOnly } = require('../middleware/auth');

// GET all products (with optional search & category filter)
router.get('/', async (req, res) => {
  const { search, category } = req.query;
  let sql = `SELECT p.*, c.name AS category_name
             FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE 1=1`;
  const params = [];
  if (search)   { sql += ' AND (p.name LIKE ? OR p.description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
  if (category) { sql += ' AND p.category_id = ?'; params.push(category); }
  sql += ' ORDER BY p.created_at DESC';
  try {
    const [rows] = await db.execute(sql, params);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET single product
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT p.*, c.name AS category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Product not found' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// CREATE product (admin)
router.post('/', auth, adminOnly, async (req, res) => {
  const { name, description, price, stock, category_id, image_url } = req.body;
  if (!name || !price) return res.status(400).json({ error: 'Name and price required' });
  try {
    const [result] = await db.execute(
      'INSERT INTO products (name, description, price, stock, category_id, image_url) VALUES (?,?,?,?,?,?)',
      [name, description, price, stock || 0, category_id, image_url]
    );
    res.status(201).json({ message: 'Product created', id: result.insertId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// UPDATE product (admin)
router.put('/:id', auth, adminOnly, async (req, res) => {
  const { name, description, price, stock, category_id, image_url } = req.body;
  try {
    await db.execute(
      'UPDATE products SET name=?, description=?, price=?, stock=?, category_id=?, image_url=? WHERE id=?',
      [name, description, price, stock, category_id, image_url, req.params.id]
    );
    res.json({ message: 'Product updated' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE product (admin)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    await db.execute('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ message: 'Product deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;

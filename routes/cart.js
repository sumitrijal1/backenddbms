const router = require('express').Router();
const db = require('../db');
const { auth } = require('../middleware/auth');

// GET cart for logged in user
router.get('/', auth, async (req, res) => {
  const [rows] = await db.execute(
    `SELECT c.id, c.quantity, p.id AS product_id, p.name, p.price, p.image_url, p.stock
     FROM cart c JOIN products p ON c.product_id = p.id
     WHERE c.user_id = ?`,
    [req.user.id]
  );
  res.json(rows);
});

// ADD to cart
router.post('/', auth, async (req, res) => {
  const { product_id, quantity = 1 } = req.body;
  try {
    await db.execute(
      `INSERT INTO cart (user_id, product_id, quantity) VALUES (?,?,?)
       ON DUPLICATE KEY UPDATE quantity = quantity + ?`,
      [req.user.id, product_id, quantity, quantity]
    );
    res.json({ message: 'Added to cart' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// UPDATE quantity
router.put('/:id', auth, async (req, res) => {
  const { quantity } = req.body;
  await db.execute('UPDATE cart SET quantity=? WHERE id=? AND user_id=?',
    [quantity, req.params.id, req.user.id]);
  res.json({ message: 'Cart updated' });
});

// REMOVE item
router.delete('/:id', auth, async (req, res) => {
  await db.execute('DELETE FROM cart WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
  res.json({ message: 'Item removed' });
});

// CLEAR cart
router.delete('/', auth, async (req, res) => {
  await db.execute('DELETE FROM cart WHERE user_id=?', [req.user.id]);
  res.json({ message: 'Cart cleared' });
});

module.exports = router;

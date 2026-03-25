const router = require('express').Router();
const db = require('../db');
const { auth, adminOnly } = require('../middleware/auth');

// Place order (checkout from cart) — now requires delivery address
router.post('/', auth, async (req, res) => {
  const { full_name, phone, address_line, city, state, pincode } = req.body;

  if (!full_name || !phone || !address_line || !city || !state || !pincode)
    return res.status(400).json({ error: 'All delivery address fields are required' });

  const delivery_address = `${full_name} | ${phone} | ${address_line}, ${city}, ${state} - ${pincode}`;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [cartItems] = await conn.execute(
      `SELECT c.*, p.price, p.stock FROM cart c JOIN products p ON c.product_id = p.id WHERE c.user_id = ?`,
      [req.user.id]
    );
    if (!cartItems.length) return res.status(400).json({ error: 'Cart is empty' });
    for (const item of cartItems) {
      if (item.stock < item.quantity)
        throw new Error(`Insufficient stock for product "${item.product_id}"`);
    }
    const total = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const [orderResult] = await conn.execute(
      'INSERT INTO orders (user_id, total_amount, delivery_address) VALUES (?,?,?)',
      [req.user.id, total, delivery_address]
    );
    const orderId = orderResult.insertId;
    for (const item of cartItems) {
      await conn.execute(
        'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?,?,?,?)',
        [orderId, item.product_id, item.quantity, item.price]
      );
      await conn.execute('UPDATE products SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.product_id]);
    }
    await conn.execute('DELETE FROM cart WHERE user_id = ?', [req.user.id]);
    await conn.commit();
    res.status(201).json({ message: 'Order placed!', order_id: orderId, total });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally { conn.release(); }
});

// GET my orders
router.get('/my', auth, async (req, res) => {
  const [rows] = await db.execute(
    `SELECT o.*, GROUP_CONCAT(p.name SEPARATOR ', ') AS items
     FROM orders o
     LEFT JOIN order_items oi ON o.id = oi.order_id
     LEFT JOIN products p ON oi.product_id = p.id
     WHERE o.user_id = ? GROUP BY o.id ORDER BY o.created_at DESC`,
    [req.user.id]
  );
  res.json(rows);
});

// GET all orders (admin)
router.get('/', auth, adminOnly, async (req, res) => {
  const [rows] = await db.execute(
    `SELECT o.*, u.name AS customer_name, u.email,
            GROUP_CONCAT(CONCAT(p.name,' x',oi.quantity) SEPARATOR ' | ') AS items
     FROM orders o
     JOIN users u ON o.user_id = u.id
     LEFT JOIN order_items oi ON o.id = oi.order_id
     LEFT JOIN products p ON oi.product_id = p.id
     GROUP BY o.id ORDER BY o.created_at DESC`
  );
  res.json(rows);
});

// UPDATE order status (admin)
router.put('/:id/status', auth, adminOnly, async (req, res) => {
  const { status } = req.body;
  await db.execute('UPDATE orders SET status=? WHERE id=?', [status, req.params.id]);
  res.json({ message: 'Status updated' });
});

module.exports = router;

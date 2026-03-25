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
//here on duplicate key update is used to handle the case when the user tries to add a product that is 
// already in the cart. Instead of inserting a new row, it updates the existing row by increasing the quantity. 
// This way, we avoid having multiple entries for the same product in the cart and simply keep track of the total quantity for 
// each product.

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
//here the reason for including user_id in the delete query is to ensure that a user can only delete items from their own cart. 
// This is an important security measure to prevent users from deleting items from other users' carts by simply guessing the cart item ID. 
// By checking both the cart item ID and the user ID, we ensure that only the owner of the cart can modify its contents.

// CLEAR cart
router.delete('/', auth, async (req, res) => {
  await db.execute('DELETE FROM cart WHERE user_id=?', [req.user.id]);
  res.json({ message: 'Cart cleared' });
});
//this delete query removes all items from the cart for the logged-in user. By specifying the user_id in the WHERE clause,
//  we ensure that only the cart items belonging to the current user are deleted, leaving other users' carts unaffected.

module.exports = router;

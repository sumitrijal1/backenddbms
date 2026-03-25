const router = require('express').Router();
const db = require('../db');
const { auth, adminOnly } = require('../middleware/auth');

router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const [[{ total_revenue }]] = await db.execute(
      "SELECT COALESCE(SUM(total_amount),0) AS total_revenue FROM orders WHERE status != 'cancelled'"
      //here coalesce is used to handle the case when there are no orders in the database. If there are no orders, 
      // the sum would return null, but with coalesce we can return 0 instead, ensuring that the total_revenue is always a number.
    );
    const [[{ total_orders }]]  = await db.execute('SELECT COUNT(*) AS total_orders FROM orders');
    const [[{ total_products }]]= await db.execute('SELECT COUNT(*) AS total_products FROM products');
    const [[{ total_customers }]]= await db.execute("SELECT COUNT(*) AS total_customers FROM users WHERE role='customer'");

    const [recentOrders] = await db.execute(
      `SELECT o.id, u.name AS customer, o.total_amount, o.status, o.created_at
       FROM orders o JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC LIMIT 5`
       //here we are selecting the most recent 5 orders along with the customer's name, total amount, status, and creation date.
    );
    const [topProducts] = await db.execute(
      `SELECT p.name, SUM(oi.quantity) AS sold
       FROM order_items oi JOIN products p ON oi.product_id = p.id
       GROUP BY p.id ORDER BY sold DESC LIMIT 5`

       
       //grouping the order items by product ID and summing the quantity sold for each product.
       //  Then we order the results by the total quantity sold in descending order and limit it to the top 5 products. 
       // This gives us a list of the best-selling products along with the total quantity sold for each.
    );
    const [lowStock] = await db.execute(
      'SELECT id, name, stock FROM products WHERE stock < 10 ORDER BY stock ASC LIMIT 5'
    );

    res.json({ total_revenue, total_orders, total_products, total_customers, recentOrders, topProducts, lowStock });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;

const router = require('express').Router();
const db = require('../db');

router.get('/', async (req, res) => {
  const [rows] = await db.execute('SELECT * FROM categories ORDER BY name');
  res.json(rows);
});
router.post('/', async (req, res) => {
  const { name } = req.body;
  const [r] = await db.execute('INSERT INTO categories (name) VALUES (?)', [name]);
  //here r is the result of the insert query, which contains the insertId of the newly created category. We return this ID along with the name in the response.
  res.status(201).json({ id: r.insertId, name });
});

module.exports = router;

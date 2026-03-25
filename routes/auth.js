const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const db     = require('../db');

// Register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: 'All fields are required' });
  try {
    const hash = await bcrypt.hash(password, 10);
    const [result] = await db.execute(
      'INSERT INTO users (name, email, password) VALUES (?,?,?)',
      [name, email, hash]
    );
    //result.insertId contains the ID of the newly created user. We return this ID along with a success message in the response.
    res.status(201).json({ message: 'Registered successfully', id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(409).json({ error: 'Email already registered' });
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    //here rows retrun all the array of users that match the provided email. Since email is unique,
    //  we expect either an empty array (no user found) or an array with one user object.
    
    if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' });
    //it means that if the query returns no rows, it means there is no user with the provided email, 
    // and we respond with a 401 Unauthorized status and an error message indicating invalid credentials. 
 
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

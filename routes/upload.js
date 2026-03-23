const router  = require('express').Router();
const upload  = require('../middleware/upload');
const { auth, adminOnly } = require('../middleware/auth');

// POST /api/upload  — admin only, single image
router.post('/', auth, adminOnly, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  // Return the URL path that frontend can use
  const imageUrl = `http://localhost:${process.env.PORT || 5000}/uploads/${req.file.filename}`;
  res.json({ imageUrl, filename: req.file.filename });
});

module.exports = router;

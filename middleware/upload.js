const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

// Make sure uploads folder exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename:    (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e6);
    cb(null, unique + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|gif/;
  const ext  = allowed.test(path.extname(file.originalname).toLowerCase());
  //here ext is a boolean that checks if the file extension of the uploaded file matches one 
  // of the allowed image formats (jpeg, jpg, png, webp, gif).
  const mime = allowed.test(file.mimetype);
  //mimetype contains the media type of the file, such as image/jpeg or image/png.
  //  We check if the mimetype matches one of the allowed types using a regular expression test.
  //here mime is a boolean that checks if the MIME type of the uploaded file matches one of the allowed image 
  // formats (jpeg, jpg, png, webp, gif).
  if (ext && mime) cb(null, true);
  else cb(new Error('Only image files are allowed (jpg, png, webp, gif)'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

module.exports = upload;

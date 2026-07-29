const express = require('express');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const CodeFile = require('../models/CodeFile');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });

  const token = authHeader.split(' ')[1]; 
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

router.post('/', requireAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const content = req.file.buffer.toString('utf-8');
    const codeFile = await CodeFile.create({
      user: req.userId,
      filename: req.file.originalname,
      content,
    });

    res.status(201).json({ id: codeFile._id, filename: codeFile.filename });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
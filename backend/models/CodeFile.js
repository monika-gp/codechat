const mongoose = require('mongoose');

const codeFileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  filename: { type: String, required: true },
  project: { type: String, default: 'Uploads' },
  content: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('CodeFile', codeFileSchema);
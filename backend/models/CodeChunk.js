const mongoose = require('mongoose');

const codeChunkSchema = new mongoose.Schema({
  codeFile: { type: mongoose.Schema.Types.ObjectId, ref: 'CodeFile', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  label: { type: String }, // e.g. function name or line range, filled in tomorrow
}, { timestamps: true });

module.exports = mongoose.model('CodeChunk', codeChunkSchema);
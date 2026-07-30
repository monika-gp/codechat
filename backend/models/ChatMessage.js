const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  codeFile: { type: mongoose.Schema.Types.ObjectId, ref: 'CodeFile', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  sources: [{ type: String }], // chunk labels used, e.g. "lines 1-40"
}, { timestamps: true });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
const express = require('express');
const jwt = require('jsonwebtoken');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const retrieveRelevantChunks = require('../utils/retriever');
const ChatMessage = require('../models/ChatMessage');

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const CodeFile = require('../models/CodeFile'); 

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

router.post('/', requireAuth, async (req, res) => {
  try {
    const { codeFileId, question } = req.body;
    if (!codeFileId || !question) {
      return res.status(400).json({ message: 'codeFileId and question are required' });
    }

    const file = await CodeFile.findOne({ _id: codeFileId, user: req.userId });
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // NEW — fetch the last few messages for this file to give the AI conversation context
    const recentMessages = await ChatMessage.find({ codeFile: codeFileId, user: req.userId })
      .sort({ createdAt: -1 })
      .limit(3);
    const conversationContext = recentMessages.reverse()
      .map(m => `Q: ${m.question}\nA: ${m.answer}`)
      .join('\n\n');

    const relevantChunks = await retrieveRelevantChunks(codeFileId, question);
    const contextText = relevantChunks.map(c => `[${c.label}]\n${c.content}`).join('\n\n');

    const model = genAI.getGenerativeModel({ model: 'gemini-flash-lite-latest' });
    const prompt = `You are a helpful assistant answering questions about a codebase.
Use only the following code context to answer. If the answer isn't in the context, say so.

${conversationContext ? `Previous conversation:\n${conversationContext}\n\n` : ''}Code context:
${contextText}

Question: ${question}`;

    const result = await model.generateContent(prompt);
    const answer = result.response.text();

    const chatMessage = await ChatMessage.create({
      codeFile: codeFileId,
      user: req.userId,
      question,
      answer,
      sources: relevantChunks.map(c => c.label),
    });

    res.status(201).json({ answer, sources: chatMessage.sources });
  } catch (err) {
  console.error(err);
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid file ID format' });
  }
  res.status(500).json({ message: 'Server error' });
}
});

// NEW — chat history route
router.get('/:codeFileId', requireAuth, async (req, res) => {
  try {
    const messages = await ChatMessage.find({
      codeFile: req.params.codeFileId,
      user: req.userId,
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
  console.error(err);
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid file ID format' });
  }
  res.status(500).json({ message: 'Server error' });
}
});

module.exports = router;
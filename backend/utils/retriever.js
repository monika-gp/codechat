const CodeChunk = require('../models/CodeChunk');

async function retrieveRelevantChunks(codeFileId, question, topN = 3) {
  const chunks = await CodeChunk.find({ codeFile: codeFileId });

  const queryWords = question.toLowerCase().split(/\W+/).filter(Boolean);

  const scored = chunks.map(chunk => {
    const chunkText = chunk.content.toLowerCase();
    const score = queryWords.reduce((count, word) => 
      chunkText.includes(word) ? count + 1 : count, 0);
    return { chunk, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topN).map(s => s.chunk);
}

module.exports = retrieveRelevantChunks;
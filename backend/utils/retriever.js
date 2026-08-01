const CodeChunk = require('../models/CodeChunk');
const { embedText, cosineSimilarity } = require('./embedder');

async function retrieveRelevantChunks(codeFileId, question, topN = 3) {
  const chunks = await CodeChunk.find({ codeFile: codeFileId });
  const queryWords = question.toLowerCase().split(/\W+/).filter(Boolean);
  const questionEmbedding = await embedText(question);

  const scored = chunks.map(chunk => {
    const chunkText = chunk.content.toLowerCase();
    const keywordScore = queryWords.reduce((count, word) =>
      chunkText.includes(word) ? count + 1 : count, 0);

    const similarity = questionEmbedding && chunk.embedding?.length
      ? cosineSimilarity(questionEmbedding, chunk.embedding)
      : 0;

    const combinedScore = (similarity * 10) + keywordScore;
    return { chunk, score: combinedScore };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topN).map(s => s.chunk);
}

module.exports = retrieveRelevantChunks;
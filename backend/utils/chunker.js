function chunkCode(content, linesPerChunk = 40, overlap = 10) {
  const lines = content.split('\n');
  const chunks = [];
  const step = linesPerChunk - overlap;

  for (let i = 0; i < lines.length; i += step) {
    const chunkLines = lines.slice(i, i + linesPerChunk);
    if (chunkLines.length === 0) break;
    chunks.push({
      content: chunkLines.join('\n'),
      label: `lines ${i + 1}-${Math.min(i + linesPerChunk, lines.length)}`,
    });
    if (i + linesPerChunk >= lines.length) break;
  }

  return chunks;
}

module.exports = chunkCode;
function chunkCode(content, linesPerChunk = 40) {
  const lines = content.split('\n');
  const chunks = [];

  for (let i = 0; i < lines.length; i += linesPerChunk) {
    const chunkLines = lines.slice(i, i + linesPerChunk);
    chunks.push({
      content: chunkLines.join('\n'),
      label: `lines ${i + 1}-${Math.min(i + linesPerChunk, lines.length)}`,
    });
  }

  return chunks;
}

module.exports = chunkCode;
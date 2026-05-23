export function parseTsv(text) {
  const lines = String(text || '').trim().split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];
  const headers = lines[0].split('\t');
  return lines.slice(1).map((line) => {
    const cols = line.split('\t');
    return Object.fromEntries(headers.map((h, i) => [h, cols[i] ?? '']));
  });
}

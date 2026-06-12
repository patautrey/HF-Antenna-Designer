export function renderLengthPlot(lengthData, container) {
  if (!lengthData || lengthData.length === 0) {
    container.innerHTML = "<p>No length sweep data.</p>";
    return;
  }

  const width = 480;
  const height = 260;

  const minFreq = Math.min(...lengthData.map(p => p.freq));
  const maxFreq = Math.max(...lengthData.map(p => p.freq));
  const maxLen = Math.max(...lengthData.map(p => p.length));

  const svg = [];

  svg.push(`<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`);

  // Gridlines
  for (let len = 0; len <= maxLen; len += maxLen / 10) {
    const y = height - 30 - (len / maxLen) * (height - 60);
    svg.push(`<line x1="40" y1="${y}" x2="${width - 20}" y2="${y}" stroke="#eee"/>`);
    svg.push(`<text x="5" y="${y + 4}" font-size="10">${len.toFixed(1)} m</text>`);
  }

  // Frequency ticks
  for (let f = minFreq; f <= maxFreq; f += 1) {
    const x = 40 + ((f - minFreq) / (maxFreq - minFreq)) * (width - 60);
    svg.push(`<line x1="${x}" y1="${height - 30}" x2="${x}" y2="${height - 25}" stroke="#ccc"/>`);
    svg.push(`<text x="${x - 6}" y="${height - 10}" font-size="10">${f}</text>`);
  }

  // Length curve
  svg.push(`<path d="`);
  lengthData.forEach((p, i) => {
    const x = 40 + ((p.freq - minFreq) / (maxFreq - minFreq)) * (width - 60);
    const y = height - 30 - (p.length / maxLen) * (height - 60);
    svg.push(`${i === 0 ? "M" : "L"} ${x} ${y}`);
  });
  svg.push(`" stroke="#0099ff" stroke-width="2" fill="none"/>`);

  svg.push(`</svg>`);

  container.innerHTML = svg.join("");
}

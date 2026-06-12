// ------------------------------------------------------------
// HIGH‑FIDELITY POLAR PLOT (NEC‑STYLE)
// ------------------------------------------------------------
export function renderPolarPlot(pattern, container) {
  if (!pattern || pattern.length === 0) {
    container.innerHTML = "<p>No pattern data.</p>";
    return;
  }

  const size = 360;
  const center = size / 2;

  // Convert linear gain to dB
  const patternDb = pattern.map(p => ({
    angle: p.angle,
    db: 20 * Math.log10(p.gain <= 0 ? 0.0001 : p.gain)
  }));

  const maxDb = 0;
  const minDb = -20;
  const ringStep = 5;

  const svg = [];
  svg.push(`<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">`);

  // dB rings
  for (let db = 0; db >= minDb; db -= ringStep) {
    const r = ((db - minDb) / (maxDb - minDb)) * center;
    svg.push(`
      <circle cx="${center}" cy="${center}" r="${r}"
        stroke="#bbb" stroke-width="0.6" fill="none" />
      <text x="${center + 4}" y="${center - r + 4}" font-size="10" fill="#666">${db} dB</text>
    `);
  }

  // Angle lines
  const angles = [0, 90, 180, 270];
  angles.forEach(a => {
    const rad = (a - 90) * Math.PI / 180;
    const x = center + center * Math.cos(rad);
    const y = center + center * Math.sin(rad);
    svg.push(`<line x1="${center}" y1="${center}" x2="${x}" y2="${y}" stroke="#ccc" stroke-width="0.6"/>`);
    svg.push(`<text x="${x}" y="${y}" font-size="10" fill="#666">${a}°</text>`);
  });

  // Pattern curve
  svg.push(`<path d="`);
  patternDb.forEach((p, i) => {
    const radius = ((p.db - minDb) / (maxDb - minDb)) * center;
    const angleRad = (p.angle - 90) * Math.PI / 180;
    const x = center + radius * Math.cos(angleRad);
    const y = center + radius * Math.sin(angleRad);
    svg.push(`${i === 0 ? "M" : "L"} ${x} ${y}`);
  });
  svg.push(`" stroke="#ff6600" stroke-width="2" fill="none"/>`);

  svg.push(`</svg>`);
  container.innerHTML = svg.join("");
}



// ------------------------------------------------------------
// HIGH‑FIDELITY SWR PLOT
// ------------------------------------------------------------
export function renderSWRPlot(swrData, container) {
  if (!swrData || swrData.length === 0) {
    container.innerHTML = "<p>No SWR data.</p>";
    return;
  }

  const width = 480;
  const height = 260;

  const minFreq = Math.min(...swrData.map(p => p.freq));
  const maxFreq = Math.max(...swrData.map(p => p.freq));
  const maxSWR = Math.max(...swrData.map(p => p.swr));

  const svg = [];
  svg.push(`<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`);

  // Horizontal gridlines (SWR)
  for (let swr = 1; swr <= maxSWR; swr += 0.5) {
    const y = height - 30 - (swr / maxSWR) * (height - 60);
    svg.push(`<line x1="40" y1="${y}" x2="${width - 20}" y2="${y}" stroke="#eee"/>`);
    svg.push(`<text x="5" y="${y + 4}" font-size="10">${swr.toFixed(1)}</text>`);
  }

  // Frequency ticks
  for (let f = minFreq; f <= maxFreq; f += 0.1) {
    const x = 40 + ((f - minFreq) / (maxFreq - minFreq)) * (width - 60);
    svg.push(`<line x1="${x}" y1="${height - 30}" x2="${x}" y2="${height - 25}" stroke="#ccc"/>`);
  }

  // SWR curve
  svg.push(`<path d="`);
  swrData.forEach((p, i) => {
    const x = 40 + ((p.freq - minFreq) / (maxFreq - minFreq)) * (width - 60);
    const y = height - 30 - (p.swr / maxSWR) * (height - 60);
    svg.push(`${i === 0 ? "M" : "L"} ${x} ${y}`);
  });
  svg.push(`" stroke="#ff6600" stroke-width="2" fill="none"/>`);

  svg.push(`</svg>`);
  container.innerHTML = svg.join("");
}



// ------------------------------------------------------------
// HIGH‑FIDELITY LENGTH PLOT (YOUR VERSION, UNCHANGED)
// ------------------------------------------------------------
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

// ------------------------------------------------------------
// NEC‑STYLE POLAR RADIATION PATTERN (SVG)
// ------------------------------------------------------------
export function renderPolarPlot(pattern, container) {
  if (!pattern || pattern.length === 0) {
    container.innerHTML = "<p>No pattern data.</p>";
    return;
  }

  const size = 320;
  const center = size / 2;
  const maxGain = Math.max(...pattern.map(p => p.gain));

  const rings = [0.25, 0.5, 0.75, 1];

  const svg = [
    `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">`,

    // Gain rings
    ...rings.map(r => `
      <circle cx="${center}" cy="${center}" r="${r * center}"
        stroke="#999" stroke-width="0.6" fill="none" />
    `),

    // Pattern curve
    `<path d="` +
      pattern.map((p, i) => {
        const angle = (p.angle - 90) * Math.PI / 180;
        const radius = (p.gain / maxGain) * center;
        const x = center + radius * Math.cos(angle);
        const y = center + radius * Math.sin(angle);
        return `${i === 0 ? "M" : "L"} ${x} ${y}`;
      }).join(" ") +
    `" stroke="#ff6600" stroke-width="2" fill="none" />`,

    `</svg>`
  ].join("");

  container.innerHTML = svg;
}



// ------------------------------------------------------------
// NEC‑STYLE SWR CURVE (SVG)
// ------------------------------------------------------------
export function renderSWRPlot(swrData, container) {
  if (!swrData || swrData.length === 0) {
    container.innerHTML = "<p>No SWR data.</p>";
    return;
  }

  const width = 420;
  const height = 220;

  const minFreq = Math.min(...swrData.map(p => p.freq));
  const maxFreq = Math.max(...swrData.map(p => p.freq));
  const maxSWR = Math.max(...swrData.map(p => p.swr));

  const svg = [
    `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`,

    // Axes
    `<line x1="40" y1="10" x2="40" y2="${height - 20}" stroke="#999"/>`,
    `<line x1="40" y1="${height - 20}" x2="${width - 10}" y2="${height - 20}" stroke="#999"/>`,

    // SWR curve
    `<path d="` +
      swrData.map((p, i) => {
        const x = 40 + ((p.freq - minFreq) / (maxFreq - minFreq)) * (width - 60);
        const y = (height - 20) - (p.swr / maxSWR) * (height - 40);
        return `${i === 0 ? "M" : "L"} ${x} ${y}`;
      }).join(" ") +
    `" stroke="#ff6600" stroke-width="2" fill="none" />`,

    `</svg>`
  ].join("");

  container.innerHTML = svg;
}



// ------------------------------------------------------------
// NEC‑STYLE LENGTH‑VS‑FREQUENCY CURVE (SVG)
// ------------------------------------------------------------
export function renderLengthPlot(lengthData, container) {
  if (!lengthData || lengthData.length === 0) {
    container.innerHTML = "<p>No length sweep data.</p>";
    return;
  }

  const width = 420;
  const height = 220;

  const minFreq = Math.min(...lengthData.map(p => p.freq));
  const maxFreq = Math.max(...lengthData.map(p => p.freq));
  const maxLen = Math.max(...lengthData.map(p => p.length));

  const svg = [
    `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`,

    // Axes
    `<line x1="40" y1="10" x2="40" y2="${height - 20}" stroke="#999"/>`,
    `<line x1="40" y1="${height - 20}" x2="${width - 10}" y2="${height - 20}" stroke="#999"/>`,

    // Length curve
    `<path d="` +
      lengthData.map((p, i) => {
        const x = 40 + ((p.freq - minFreq) / (maxFreq - minFreq)) * (width - 60);
        const y = (height - 20) - (p.length / maxLen) * (height - 40);
        return `${i === 0 ? "M" : "L"} ${x} ${y}`;
      }).join(" ") +
    `" stroke="#0099ff" stroke-width="2" fill="none" />`,

    `</svg>`
  ].join("");

  container.innerHTML = svg;
}

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

  const maxDb = 0;          // normalized
  const minDb = -20;        // outer ring
  const ringStep = 5;       // 0, -5, -10, -15, -20

  const svg = [];

  svg.push(`<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">`);

  // Draw dB rings
  for (let db = 0; db >= minDb; db -= ringStep) {
    const r = ((db - minDb) / (maxDb - minDb)) * center;
    svg.push(`
      <circle cx="${center}" cy="${center}" r="${r}"
        stroke="#bbb" stroke-width="0.6" fill="none" />
      <text x="${center + 4}" y="${center - r + 4}" font-size="10" fill="#666">${db} dB</text>
    `);
  }

  // Draw angle lines
  const angles = [0, 90, 180, 270];
  angles.forEach(a => {
    const rad = (a - 90) * Math.PI / 180;
    const x = center + center * Math.cos(rad);
    const y = center + center * Math.sin(rad);
    svg.push(`<line x1="${center}" y1="${center}" x2="${x}" y2="${y}" stroke="#ccc" stroke-width="0.6"/>`);
    svg.push(`<text x="${x}" y="${y}" font-size="10" fill="#666">${a}°</text>`);
  });

  // Draw pattern curve
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

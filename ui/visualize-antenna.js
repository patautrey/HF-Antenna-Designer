export function visualizeAntenna(deckText) {
  const canvas = document.createElement("canvas");
  canvas.width = 600;
  canvas.height = 400;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#f9f9f9";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#1e3a5f";
  ctx.lineWidth = 2;

  const lines = deckText.split("\n").filter(l => l.startsWith("GW"));
  lines.forEach(line => {
    const parts = line.split(" ").filter(Boolean);
    const x1 = parseFloat(parts[3]);
    const z1 = parseFloat(parts[5]);
    const x2 = parseFloat(parts[6]);
    const z2 = parseFloat(parts[8]);
    ctx.beginPath();
    ctx.moveTo(300 + x1 * 50, 350 - z1 * 50);
    ctx.lineTo(300 + x2 * 50, 350 - z2 * 50);
    ctx.stroke();
  });

  return canvas;
}

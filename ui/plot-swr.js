// /ui/plot-swr.js

import { parseNecOutput } from "./parse-nec-output.js";

export async function plotSWR(deckGenerator, params, container) {
  container.innerHTML = "<h3>SWR Curve</h3>";

  const canvas = document.createElement("canvas");
  canvas.width = 600;
  canvas.height = 300;
  container.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const f0 = params.frequencyMHz;
  const fStart = f0 * 0.9;
  const fEnd = f0 * 1.1;
  const steps = 21;

  const freqs = [];
  const swrValues = [];

  for (let i = 0; i < steps; i++) {
    const f = fStart + (i / (steps - 1)) * (fEnd - fStart);
    freqs.push(f);

    const sweepParams = { ...params, frequencyMHz: f };
    const deck = deckGenerator(sweepParams);

    // NEC output is not generated in-browser, so we simulate SWR
    // by a simple resonance curve approximation.
    const delta = Math.abs(f - f0);
    const swr = 1 + (delta / (f0 * 0.05)) ** 2;
    swrValues.push(swr);
  }

  const maxSWR = Math.max(...swrValues);
  const minSWR = Math.min(...swrValues);

  ctx.strokeStyle = "#1e3a5f";
  ctx.lineWidth = 2;
  ctx.beginPath();

  for (let i = 0; i < steps; i++) {
    const x = (i / (steps - 1)) * canvas.width;
    const y = canvas.height - ((swrValues[i] - minSWR) / (maxSWR - minSWR)) * canvas.height;

    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }

  ctx.stroke();

  ctx.fillStyle = "#000";
  ctx.font = "14px Arial";
  ctx.fillText(`Center Frequency: ${f0.toFixed(2)} MHz`, 10, 20);
  ctx.fillText(`Min SWR: ${minSWR.toFixed(2)}`, 10, 40);
}

export default function calculate(params = {}) {
  const frequencyMHz = params.frequencyMHz || 27.2;
  const vf = params.velocityFactor || 0.66;
  const c = 299792458;

  // Basic lengths
  const wavelength = c / (frequencyMHz * 1e6);
  const halfWave = wavelength / 2;
  const quarterWave = wavelength / 4;

  const radiatorLength = halfWave * vf;
  const sleeveLength = quarterWave * vf;

  // ------------------------------------------------------------
  // NEC‑STYLE RADIATION PATTERN (simple vertical monopole model)
  // ------------------------------------------------------------
  const pattern = [];
  for (let angle = 0; angle <= 360; angle += 5) {
    const rad = angle * Math.PI / 180;
    const gain = Math.abs(Math.cos(rad)); // simple vertical pattern
    pattern.push({ angle, gain });
  }

  // ------------------------------------------------------------
  // SWR SWEEP (±0.7 MHz around center)
  // ------------------------------------------------------------
  const swr = [];
  for (let f = frequencyMHz - 0.7; f <= frequencyMHz + 0.7; f += 0.05) {
    const delta = Math.abs(f - frequencyMHz);
    const swrValue = 1 + delta * 3; // simple model
    swr.push({ freq: Number(f.toFixed(3)), swr: Number(swrValue.toFixed(2)) });
  }

  // ------------------------------------------------------------
  // LENGTH VS FREQUENCY SWEEP (HF bands)
  // ------------------------------------------------------------
  const lengthSweep = [];
  const bands = [3.5, 7.0, 10.1, 14.0, 18.1, 21.0, 24.9, 28.0];
  for (const f of bands) {
    const wl = c / (f * 1e6);
    const len = (wl / 2) * vf;
    lengthSweep.push({ freq: f, length: Number(len.toFixed(3)) });
  }

  return {
    success: true,
    frequencyMHz,
    calculated: {
      radiatorLengthMeters: Number(radiatorLength.toFixed(3)),
      sleeveLengthMeters: Number(sleeveLength.toFixed(3)),
      totalAntennaLengthMeters: Number((radiatorLength + sleeveLength).toFixed(3)),
      feedpointImpedance: "~50 Ω typical"
    },
    notes: [
      "Radiator length depends on coax velocity factor.",
      "Sleeve balun length is typically a quarter-wave.",
      "Adjust radiator length for SWR tuning.",
      "Height above ground affects takeoff angle."
    ],
    pattern,
    swr,
    lengthSweep
  };
}

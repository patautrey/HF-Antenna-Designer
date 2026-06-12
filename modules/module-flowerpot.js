export default function calculate(params = {}) {
  const frequencyMHz = params.frequencyMHz || 27.2; // CB/11m default
  const c = 299792458;

  // Half‑wave radiator
  const wavelength = c / (frequencyMHz * 1e6);
  const halfWave = wavelength / 2;

  // Coax velocity factor (typical RG‑58)
  const vf = params.velocityFactor || 0.66;
  const radiatorLength = halfWave * vf;

  // Sleeve balun length (quarter‑wave)
  const quarterWave = wavelength / 4;
  const sleeveLength = quarterWave * vf;

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
      "Sleeve balun length is typically a quarter‑wave.",
      "Adjust radiator length for SWR tuning.",
      "Height above ground affects takeoff angle."
    ]
  };
}

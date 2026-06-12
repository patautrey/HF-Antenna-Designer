export default function calculate(params = {}) {
  const frequencyMHz = params.frequencyMHz || 7.1;
  const c = 299792458;

  const wavelength = c / (frequencyMHz * 1e6);
  const totalLength = wavelength / 2;
  const legLength = totalLength / 2;

  return {
    success: true,
    frequencyMHz,
    calculated: {
      totalLengthMeters: Number(totalLength.toFixed(3)),
      legLengthMeters: Number(legLength.toFixed(3)),
      feedpointImpedance: "~50–75 Ω typical"
    },
    notes: [
      "Length is approximate; adjust for height and wire diameter.",
      "Lower apex height increases takeoff angle.",
      "Leg angle affects impedance and bandwidth."
    ]
  };
}

// /modules/necgen-groundplane.js

export default {
  name: "Quarter‑Wave Ground Plane",
  description: "Vertical radiator with four sloping radials.",
  imageQueries: [
    "ground_plane_antenna_diagram",
    "quarter_wave_vertical_nec_geometry"
  ],

  paramsSchema: {
    frequencyMHz: { label: "Frequency (MHz)", type: "number", default: 28.5 },
    radiatorLength: { label: "Radiator Length (m)", type: "number", default: 2.63 },
    radialLength: { label: "Radial Length (m)", type: "number", default: 2.63 },
    radialAngle: { label: "Radial Angle (°)", type: "number", default: 45 },
    height: { label: "Height Above Ground (m)", type: "number", default: 5 },
    wireDiameter: { label: "Wire Diameter (m)", type: "number", default: 0.002 }
  },

  generateDeck(params) {
    const {
      frequencyMHz,
      radiatorLength,
      radialLength,
      radialAngle,
      height,
      wireDiameter
    } = params;

    const segments = 31;
    const angleRad = radialAngle * Math.PI / 180;

    let deck = `
CM Quarter‑wave ground plane with 4 radials
CE
`;

    // Vertical radiator
    deck += `GW 1 ${segments} 0 0 ${height} 0 0 ${height + radiatorLength} ${wireDiameter}\n`;

    // Radials
    const radials = 4;
    for (let i = 0; i < radials; i++) {
      const az = (2 * Math.PI * i) / radials;
      const x = radialLength * Math.cos(az) * Math.cos(angleRad);
      const y = radialLength * Math.sin(az) * Math.cos(angleRad);
      const z = height - radialLength * Math.sin(angleRad);

      deck += `GW ${i + 2} ${segments} 0 0 ${height} ${x} ${y} ${z} ${wireDiameter}\n`;
    }

    deck += `
GE 0
GN 2 0 0 0 13 0.005
EX 0 1 1 0 1 0
FR 0 1 0 0 ${frequencyMHz} 0
RP 0 181 1 1000 0 0 1 1
EN
`;

    return deck;
  },

  modelingNotes: `
This model uses a 31‑segment radiator and four 31‑segment radials at a user‑defined angle.
`
};

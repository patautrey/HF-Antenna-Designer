// /modules/necgen-flowerpot.js

export default {
  name: "Flowerpot (T2LT)",
  description: "A coaxial sleeve dipole using a 12‑wire segmented RG‑58 braid sleeve balun.",
  imageQueries: [
    "t2lt_flowerpot_antenna_diagram",
    "coaxial_sleeve_dipole_nec_geometry"
  ],

  paramsSchema: {
    frequencyMHz: { label: "Frequency (MHz)", type: "number", default: 27.2 },
    radiatorLength: { label: "Radiator Length (m)", type: "number", default: 3.637 },
    sleeveLength: { label: "Sleeve Length (m)", type: "number", default: 1.819 },
    height: { label: "Height Above Ground (m)", type: "number", default: 5 },
    wireDiameter: { label: "Wire Diameter (m)", type: "number", default: 0.002 }
  },

  generateDeck(params) {
    const {
      frequencyMHz,
      radiatorLength,
      sleeveLength,
      height,
      wireDiameter
    } = params;

    const braidRadius = 0.0025; // RG‑58 radius
    const wires = 12;
    const segments = 31;

    let deck = `
CM Flowerpot (T2LT) with 12‑wire segmented RG‑58 braid
CE
`;

    // Radiator wire (inside sleeve)
    deck += `GW 1 ${segments} 0 0 ${height} 0 0 ${height - radiatorLength} ${wireDiameter}\n`;

    // Sleeve wires (12 around circumference)
    for (let i = 0; i < wires; i++) {
      const angle = (2 * Math.PI * i) / wires;
      const x = braidRadius * Math.cos(angle);
      const y = braidRadius * Math.sin(angle);

      deck += `GW ${i + 2} ${segments} ${x} ${y} ${height} ${x} ${y} ${height - sleeveLength} ${wireDiameter}\n`;
    }

    deck += `
GE 0
GN 2 0 0 0 13 0.005
EX 0 1 ${Math.ceil(segments / 2)} 0 1 0
FR 0 1 0 0 ${frequencyMHz} 0
RP 0 181 1 1000 0 0 1 1
EN
`;

    return deck;
  },

  modelingNotes: `
This model uses a 12‑wire segmented RG‑58 braid sleeve with 31 segments per wire.
The radiator is centered inside the sleeve. The sleeve is shorted at the top and open at the bottom.
`
};

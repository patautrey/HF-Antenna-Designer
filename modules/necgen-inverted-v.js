// /modules/necgen-inverted-v.js

export default {
  name: "Inverted V",
  description: "A classic inverted‑V dipole with user‑defined apex height, leg length, and angle.",
  imageQueries: [
    "inverted_v_antenna_diagram",
    "inverted_v_nec_geometry"
  ],

  paramsSchema: {
    frequencyMHz: { label: "Frequency (MHz)", type: "number", default: 7.1 },
    apexHeight: { label: "Apex Height (m)", type: "number", default: 10 },
    legLength: { label: "Leg Length (m)", type: "number", default: 10.556 },
    wireDiameter: { label: "Wire Diameter (m)", type: "number", default: 0.002 },
    angle: { label: "Included Angle (°)", type: "number", default: 120 }
  },

  generateDeck(params) {
    const {
      frequencyMHz,
      apexHeight,
      legLength,
      wireDiameter,
      angle
    } = params;

    const segments = 31;
    const halfAngle = (angle * Math.PI) / 360;

    const x = legLength * Math.sin(halfAngle);
    const z = apexHeight - legLength * Math.cos(halfAngle);

    let deck = `
CM Inverted‑V Dipole
CE
`;

    // Left leg
    deck += `GW 1 ${segments} 0 0 ${apexHeight} -${x} 0 ${z} ${wireDiameter}\n`;

    // Right leg
    deck += `GW 2 ${segments} 0 0 ${apexHeight}  ${x} 0 ${z} ${wireDiameter}\n`;

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
This inverted‑V model uses 31 segments per leg and places the feedpoint at the apex.
The included angle controls the horizontal spread of the legs.
`
};

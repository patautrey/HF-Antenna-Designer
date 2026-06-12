// /modules/necgen-g5rv.js

export default {
  name: "G5RV",
  description: "Classic 31.1 m dipole with 10.36 m ladder line feeder.",
  imageQueries: [
    "g5rv_antenna_diagram",
    "g5rv_nec_geometry"
  ],

  paramsSchema: {
    frequencyMHz: { label: "Frequency (MHz)", type: "number", default: 14.2 },
    totalLength: { label: "Total Length (m)", type: "number", default: 31.1 },
    ladderLine: { label: "Ladder Line Length (m)", type: "number", default: 10.36 },
    height: { label: "Height Above Ground (m)", type: "number", default: 10 },
    wireDiameter: { label: "Wire Diameter (m)", type: "number", default: 0.002 }
  },

  generateDeck(params) {
    const {
      frequencyMHz,
      totalLength,
      ladderLine,
      height,
      wireDiameter
    } = params;

    const half = totalLength / 2;
    const segments = 31;

    let deck = `
CM G5RV full model with ladder line
CE
`;

    // Dipole arms
    deck += `GW 1 ${segments} 0 0 ${height} -${half} 0 ${height} ${wireDiameter}\n`;
    deck += `GW 2 ${segments} 0 0 ${height}  ${half} 0 ${height} ${wireDiameter}\n`;

    // Ladder line (two parallel wires)
    const spacing = 0.05; // 5 cm typical
    deck += `GW 3 ${segments} -${spacing / 2} 0 ${height} -${spacing / 2} 0 ${height - ladderLine} ${wireDiameter}\n`;
    deck += `GW 4 ${segments}  ${spacing / 2} 0 ${height}  ${spacing / 2} 0 ${height - ladderLine} ${wireDiameter}\n`;

    deck += `
GE 0
GN 2 0 0 0 13 0.005
EX 0 3 ${Math.ceil(segments / 2)} 0 1 0
FR 0 1 0 0 ${frequencyMHz} 0
RP 0 181 1 1000 0 0 1 1
EN
`;

    return deck;
  },

  modelingNotes: `
This G5RV model includes a 31.1 m dipole and a 10.36 m ladder line.
Feedpoint is at the top of the ladder line.
`
};

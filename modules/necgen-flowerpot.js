// /modules/necgen-flowerpot.js

export default {
  name: "Flowerpot (T2LT)",
  description: "A coaxial sleeve dipole using a 12-wire segmented RG-58 braid sleeve balun.",
  paramsSchema: {
    frequencyMHz: 27.2,
    radiatorLength: 3.637,
    sleeveLength: 1.819,
    heightAboveGround: 5,
    wireDiameter: 0.002
  },

  generateDeck(params) {
    const {
      frequencyMHz,
      radiatorLength,
      sleeveLength,
      heightAboveGround,
      wireDiameter
    } = params;

    const segments = 31;
    const sleeveTop = heightAboveGround;
    const sleeveBottom = heightAboveGround - sleeveLength;
    const radiatorTop = sleeveBottom;
    const radiatorBottom = sleeveBottom - radiatorLength;

    let deck = `
CM Flowerpot (T2LT) with 12-wire segmented RG-58 braid
CE
`;

    // Sleeve section
    deck += `GW 1 ${segments} 0 0 ${sleeveTop} 0 0 ${sleeveBottom} ${wireDiameter}\n`;

    // Radiator section
    deck += `GW 2 ${segments} 0 0 ${radiatorTop} 0 0 ${radiatorBottom} ${wireDiameter}\n`;

    deck += `
GE 0
GN 2 0 0 0 13 0.005
EX 0 1 ${Math.ceil(segments / 2)} 0 1 0
FR 0 1 0 0 ${frequencyMHz} 0
RP 0 181 1 1000 0 0 1 1
EN
`;

    return deck;
  }
};

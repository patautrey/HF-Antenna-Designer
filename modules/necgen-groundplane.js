export default {
  name: "Quarter‑Wave Ground Plane",
  description: "Vertical radiator with four sloping radials.",
  paramsSchema: {
    frequencyMHz: 27.2,
    radiatorLength: 2.75,
    wireDiameter: 0.002
  },

  generateDeck(params) {
    const { frequencyMHz, radiatorLength, wireDiameter } = params;
    const segments = 31;
    const angle = 45 * Math.PI / 180;
    const radialLength = radiatorLength;
    const x = radialLength * Math.sin(angle);
    const z = radialLength * Math.cos(angle);

    return `
CM Quarter‑wave ground plane with 4 radials
CE
GW 1 ${segments} 0 0 0 0 0 ${radiatorLength} ${wireDiameter}
GW 2 ${segments} 0 0 0  ${x} 0 -${z} ${wireDiameter}
GW 3 ${segments} 0 0 0 -${x} 0 -${z} ${wireDiameter}
GW 4 ${segments} 0 0 0  0  ${x} -${z} ${wireDiameter}
GW 5 ${segments} 0 0 0  0 -${x} -${z} ${wireDiameter}
GE 0
GN 2 0 0 0 13 0.005
EX 0 1 ${Math.ceil(segments / 2)} 0 1 0
FR 0 1 0 0 ${frequencyMHz} 0
RP 0 181 1 1000 0 0 1 1
EN
`;
  }
};

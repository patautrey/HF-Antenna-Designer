// /modules/necgen-inverted-v.js

export default {
  name: "Inverted V",
  description: "A classic inverted‑V dipole with user‑defined apex height, leg length, and angle.",
  paramsSchema: {
    frequencyMHz: 7.1,
    apexHeight: 10,
    legLength: 10.556,
    wireDiameter: 0.002,
    angle: 120
  },
  generateDeck(params) {
    const { frequencyMHz, apexHeight, legLength, wireDiameter, angle } = params;
    const segments = 31;
    const halfAngle = (angle * Math.PI) / 360;
    const x = legLength * Math.sin(halfAngle);
    const z = apexHeight - legLength * Math.cos(halfAngle);
    return `
CM Inverted‑V Dipole
CE
GW 1 ${segments} 0 0 ${apexHeight} -${x} 0 ${z} ${wireDiameter}
GW 2 ${segments} 0 0 ${apexHeight}  ${x} 0 ${z} ${wireDiameter}
GE 0
GN 2 0 0 0 13 0.005
EX 0 1 ${Math.ceil(segments / 2)} 0 1 0
FR 0 1 0 0 ${frequencyMHz} 0
RP 0 181 1 1000 0 0 1 1
EN
`;
  }
};

export default {
  name: "G5RV",
  description: "Classic 31.1 m dipole with 10.36 m ladder line feeder.",
  paramsSchema: {
    frequencyMHz: 14.2,
    dipoleLength: 31.1,
    ladderLength: 10.36,
    wireDiameter: 0.002
  },

  generateDeck(params) {
    const { frequencyMHz, dipoleLength, ladderLength, wireDiameter } = params;
    const segments = 31;
    const halfDipole = dipoleLength / 2;
    const ladderBottom = -ladderLength;

    return `
CM G5RV full model with ladder line
CE
GW 1 ${segments} 0 0 0 -${halfDipole} 0 0 ${wireDiameter}
GW 2 ${segments} 0 0 0  ${halfDipole} 0 0 ${wireDiameter}
GW 3 ${segments} -0.025 0 0 -0.025 0 ${ladderBottom} ${wireDiameter}
GW 4 ${segments}  0.025 0 0  0.025 0 ${ladderBottom} ${wireDiameter}
GE 0
GN 2 0 0 0 13 0.005
EX 0 3 ${Math.ceil(segments / 2)} 0 1 0
FR 0 1 0 0 ${frequencyMHz} 0
RP 0 181 1 1000 0 0 1 1
EN
`;
  }
};

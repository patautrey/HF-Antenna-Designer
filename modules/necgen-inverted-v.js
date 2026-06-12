export function generateInvertedVDeck(params) {
  const { frequencyMHz, apexHeight, legLength, wireDiameter, angle } = params;

  const halfSpan = legLength * Math.sin((angle / 2) * Math.PI / 180);
  const drop = legLength * Math.cos((angle / 2) * Math.PI / 180);

  return `
CM Inverted-V Dipole
CE
GW 1 21 0 0 ${apexHeight}  -${halfSpan} 0 ${apexHeight - drop} ${wireDiameter}
GW 2 21 0 0 ${apexHeight}   ${halfSpan} 0 ${apexHeight - drop} ${wireDiameter}
GE 0
GN 2 0 0 0 13 0.005
EX 0 1 11 0 1 0
FR 0 1 0 0 ${frequencyMHz} 0
RP 0 181 1 1000 0 0 1 1
EN
`;
}

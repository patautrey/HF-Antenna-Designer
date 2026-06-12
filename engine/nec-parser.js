export function parseNECOutput(text) {
  const pattern = [];
  const swr = [];
  const impedance = [];

  const lines = text.split("\n");

  for (const line of lines) {
    if (line.includes("DEGREES") && line.includes("GAIN DB")) {
      const parts = line.trim().split(/\s+/);
      pattern.push({
        angle: Number(parts[0]),
        gain: Number(parts[1])
      });
    }

    if (line.includes("FREQUENCY") && line.includes("SWR")) {
      const parts = line.trim().split(/\s+/);
      swr.push({
        freq: Number(parts[1]),
        swr: Number(parts[3])
      });
    }

    if (line.includes("IMPEDANCE")) {
      const parts = line.trim().split(/\s+/);
      impedance.push({
        r: Number(parts[1]),
        x: Number(parts[2])
      });
    }
  }

  return { pattern, swr, impedance };
}

// /ui/parse-nec-output.js

export function parseNecOutput(text) {
  const gainMatch = text.match(/GAIN\s*=\s*([\d.]+)/i);
  const impedanceMatch = text.match(/IMPEDANCE\s*=\s*([\d.]+)\s*\+\s*j([\d.]+)/i);
  const swrMatch = text.match(/SWR\s*=\s*([\d.]+)/i);

  return {
    gain: gainMatch ? parseFloat(gainMatch[1]) : null,
    impedance: impedanceMatch
      ? `${impedanceMatch[1]} + j${impedanceMatch[2]}`
      : null,
    swr: swrMatch ? parseFloat(swrMatch[1]) : null
  };
}

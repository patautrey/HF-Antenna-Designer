import { antennaRegistry } from "./antenna-registry.js";

export default function antennaSelector() {
  const options = Object.entries(antennaRegistry)
    .map(([key, entry]) => `<option value="${key}">${entry.label}</option>`)
    .join("");

  return `
    <label for="antenna_select">Select Antenna:</label>
    <select id="antenna_select">
      ${options}
    </select>
  `;
}

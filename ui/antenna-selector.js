// HF-Antenna-Designer/ui/antenna-selector.js
// Registry Mode — Full Replacement File

export default function antennaSelector() {
    return `
        <label for="antenna_select"><strong>Select Antenna:</strong></label>
        <select id="antenna_select">
            <option value="flowerpot">Flowerpot</option>
            <option value="invertedV">Inverted‑V</option>
            <option value="yagi3">Vertical Yagi 3‑Element</option>
        </select>
    `;
}

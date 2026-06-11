// HF-Antenna-Designer/ui/antenna-selector.js

export default function antennaSelector() {
    return `
        <label for="antenna_select">Select Antenna:</label>
        <select id="antenna_select">
            <option value="flowerpot">Flowerpot (T2LT)</option>
            <option value="dipole">Dipole</option>
            <option value="endFed">End-Fed</option>
            <option value="loop">Loop</option>
            <option value="quad">Quad</option>
            <option value="moxon">Moxon</option>
            <option value="verticalYagi">Vertical Yagi</option>
            <option value="jPole">J-Pole</option>
            <option value="invertedV">Inverted V</option>
            <option value="yagi3">3‑Element Yagi</option>
        </select>
    `;
}

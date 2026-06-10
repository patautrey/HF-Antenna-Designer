export default function antennaSelector() {
    return `
        <label for="antenna_select">Select Antenna:</label>
        <select id="antenna_select">
            <option value="flowerpot">Flowerpot</option>
            <option value="invertedV">Inverted-V</option>
            <option value="yagi3">Vertical Yagi 3-Element</option>
        </select>
    `;
}

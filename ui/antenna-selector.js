import app from "../app/app.js";

export default function antennaSelector() {
    const options = Object.keys(app.panels)
        .sort()
        .map(name => `<option value="${name}">${name}</option>`)
        .join("");

    return `
        <label for="antenna_select">Select Antenna:</label>
        <select id="antenna_select">${options}</select>
    `;
}

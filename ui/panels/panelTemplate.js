// ui/panels/panelTemplate.js
export default function PanelTemplate(name, runSimulation) {
    return `
        <h2>${name} Antenna Configuration</h2>

        <label>Frequency (MHz)</label>
        <input id="freq" type="number" value="146">

        <label>Velocity Factor</label>
        <input id="vf" type="number" step="0.01" value="0.66">

        <label>PVC Outer Diameter (mm)</label>
        <input id="pvc" type="number" value="25">

        <label>Target Choke Reactance (Ω)</label>
        <input id="react" type="number" value="500">

        <label>Radial Count</label>
        <input id="radials" type="number" value="4">

        <label>Radial Length (λ)</label>
        <input id="radialLength" type="number" step="0.01" value="0.25">

        <label>Elevated Radials</label>
        <select id="elevated">
            <option value="no">No</option>
            <option value="yes">Yes</option>
        </select>

        <label>Element Height (m)</label>
        <input id="height" type="number" value="1.5">

        <label>Location Model</label>
        <select id="seaside">
            <option value="normal">Normal</option>
            <option value="seaside">Seaside DX</option>
        </select>

        <label>DX Turbo Mode</label>
        <select id="turbo">
            <option value="off">Disabled</option>
            <option value="on">DX Turbo</option>
        </select>

        <label>Transmitter Power (W)</label>
        <input id="power" type="number" value="100">

        <label>Feedline Loss (dB)</label>
        <input id="loss" type="number" step="0.1" value="1.0">

        <button id="runBtn">Run Simulation</button>
    `;
}

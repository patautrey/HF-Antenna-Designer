// ui/panels/FlowerpotPanel.js

export default function FlowerpotPanel(runSimulation) {
    return `
        <h2>Flowerpot Antenna Configuration</h2>

        <label for="freq">Frequency (MHz)</label>
        <input id="freq" type="number" value="146">

        <label for="vf">Velocity Factor</label>
        <input id="vf" type="number" step="0.01" value="0.66">

        <button id="runBtn">Run Simulation</button>
    `;
}

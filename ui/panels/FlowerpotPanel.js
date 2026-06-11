export default function FlowerpotPanel(runSimulation) {
    return `
        <h2>Flowerpot Configuration</h2>

        <label>Frequency (MHz)</label>
        <input id="freq" value="146">

        <label>Velocity Factor</label>
        <input id="vf" value="0.66">

        <button id="runBtn">Run Simulation</button>
    `;
}

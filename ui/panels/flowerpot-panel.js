export default class FlowerpotPanel {

    constructor(app) {
        this.app = app;
    }

    render() {
        return `
        <div class="antenna-panel">
            <h2>Flowerpot (T2LT) Antenna</h2>

            <label>Frequency (MHz)</label>
            <input id="fp_freq" type="number" value="146">

            <label>Coax Type</label>
            <select id="fp_coax">
                <option>RG58</option>
                <option>RG8X</option>
                <option>RG174</option>
                <option>LMR240</option>
                <option>LMR400</option>
                <option>RG6</option>
            </select>

            <label>PVC Outside Diameter (mm)</label>
            <input id="fp_pvc_od" type="number" value="25">

            <label>Mounting Mode</label>
            <select id="fp_pvc_mode">
                <option value="outside">Outside PVC</option>
                <option value="inside">Inside PVC</option>
            </select>

            <label>Target Choke Reactance (Ω)</label>
            <input id="fp_xl" type="number" value="500">

            <button id="fp_run">Run Simulation</button>

            <h3>Tuning Guide</h3>
            <div class="tuning-guide">
                <p><b>1.</b> Build slightly long.</p>
                <p><b>2.</b> Sweep with a NanoVNA.</p>
                <p><b>3.</b> Find lowest SWR.</p>
                <p><b>4.</b> If resonance is low, trim.</p>
                <p><b>5.</b> Ratio method:</p>
                <pre>Lnew = Lold × (f_current / f_target)</pre>
                <p><b>6.</b> Trim in small increments.</p>
                <p><b>7.</b> Add choke turns if SWR shifts when touching coax.</p>
            </div>

            <div id="fp_results"></div>
        </div>
        `;
    }

    attachEvents() {
        document.getElementById("fp_run").onclick = () => {
            const config = {
                type: "flowerpot",
                frequency: Number(document.getElementById("fp_freq").value) * 1e6,
                coaxType: document.getElementById("fp_coax").value,
                pvcOD: Number(document.getElementById("fp_pvc_od").value),
                pvcMode: document.getElementById("fp_pvc_mode").value,
                targetReactance: Number(document.getElementById("fp_xl").value)
            };

            this.app.runSimulation(config, "fp_results");
        };
    }
}

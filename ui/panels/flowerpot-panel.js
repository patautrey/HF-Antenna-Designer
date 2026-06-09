/* ============================================================
   Flowerpot (T2LT) Antenna — UI Panel
   Includes: Presets + Simulation + Tuning Calculator
   ============================================================ */

import { FlowerpotPresets } from "/ui/presets/flowerpot-presets.js";
import { computeFlowerpotTuning } from "/ui/tools/flowerpot-tuning-calc.js";

export default class FlowerpotPanel {

    constructor(app) {
        this.app = app;
    }

    render() {
        return `
        <div class="antenna-panel">
            <h2>Flowerpot (T2LT) Antenna</h2>

            <label>Band Preset</label>
            <select id="fp_preset">
                <option value="">Custom</option>
                <option value="2m">2m (146 MHz)</option>
                <option value="70cm">70cm (446 MHz)</option>
                <option value="6m">6m (52 MHz)</option>
                <option value="10m">10m (28.5 MHz)</option>
                <option value="gmrs">GMRS (462 MHz)</option>
                <option value="cb">CB (27 MHz)</option>
            </select>

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

            <h3>Tuning Calculator</h3>

            <label>Measured Resonant Frequency (MHz)</label>
            <input id="fp_measured" type="number" value="139.35">

            <label>Target Frequency (MHz)</label>
            <input id="fp_target" type="number" value="146">

            <label>Current Top Length (mm)</label>
            <input id="fp_top_len" type="number" value="468">

            <label>Current Bottom Length (mm)</label>
            <input id="fp_bottom_len" type="number" value="458">

            <button id="fp_calc_tune">Calculate Trim</button>

            <div id="fp_tune_results"></div>

            <div id="fp_results"></div>
        </div>
        `;
    }

    attachEvents() {

        // Preset selection
        document.getElementById("fp_preset").onchange = () => {
            const key = document.getElementById("fp_preset").value;
            if (!key) return;

            const p = FlowerpotPresets[key];

            document.getElementById("fp_freq").value = p.frequency;
            document.getElementById("fp_coax").value = p.coaxType;
            document.getElementById("fp_pvc_od").value = p.pvcOD;
            document.getElementById("fp_pvc_mode").value = p.pvcMode;
            document.getElementById("fp_xl").value = p.targetReactance;
        };

        // Run simulation
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

        // Tuning calculator
        document.getElementById("fp_calc_tune").onclick = () => {

            const measured = Number(document.getElementById("fp_measured").value);
            const target = Number(document.getElementById("fp_target").value);
            const topLen = Number(document.getElementById("fp_top_len").value);
            const bottomLen = Number(document.getElementById("fp_bottom_len").value);

            const result = computeFlowerpotTuning(measured, target, topLen, bottomLen);

            document.getElementById("fp_tune_results").innerHTML = `
                <p><b>Ratio:</b> ${result.ratio.toFixed(4)}</p>
                <p><b>New Top Length:</b> ${result.newTop.toFixed(1)} mm</p>
                <p><b>New Bottom Length:</b> ${result.newBottom.toFixed(1)} mm</p>
                <p><b>Trim Top:</b> ${result.trimTop.toFixed(1)} mm</p>
                <p><b>Trim Bottom:</b> ${result.trimBottom.toFixed(1)} mm</p>
            `;
        };
    }
}

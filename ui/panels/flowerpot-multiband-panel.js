/* ============================================================
   Multi‑Band Flowerpot (T2LT) Designer Panel
   ============================================================ */

import { FlowerpotPresets } from "/ui/presets/flowerpot-presets.js";
import { computeFlowerpotTuning } from "/ui/tools/flowerpot-tuning-calc.js";

export default class FlowerpotMultibandPanel {

    constructor(app) {
        this.app = app;
    }

    render() {
        return `
        <div class="antenna-panel">
            <h2>Multi‑Band Flowerpot Designer</h2>

            <label>Select Band</label>
            <select id="mb_band">
                <option value="">Custom Frequency</option>
                <option value="2m">2m (146 MHz)</option>
                <option value="70cm">70cm (446 MHz)</option>
                <option value="6m">6m (52 MHz)</option>
                <option value="10m">10m (28.5 MHz)</option>
                <option value="gmrs">GMRS (462 MHz)</option>
                <option value="cb">CB (27 MHz)</option>
            </select>

            <label>Custom Frequency (MHz)</label>
            <input id="mb_freq" type="number" value="146">

            <label>Coax Type</label>
            <select id="mb_coax">
                <option>RG58</option>
                <option>RG8X</option>
                <option>RG174</option>
                <option>LMR240</option>
                <option>LMR400</option>
                <option>RG6</option>
            </select>

            <label>PVC Outside Diameter (mm)</label>
            <input id="mb_pvc_od" type="number" value="25">

            <label>Mounting Mode</label>
            <select id="mb_pvc_mode">
                <option value="outside">Outside PVC</option>
                <option value="inside">Inside PVC</option>
            </select>

            <label>Target Choke Reactance (Ω)</label>
            <input id="mb_xl" type="number" value="500">

            <button id="mb_generate">Generate Design</button>

            <div id="mb_output"></div>
        </div>
        `;
    }

    attachEvents() {

        // Band selection
        document.getElementById("mb_band").onchange = () => {
            const key = document.getElementById("mb_band").value;
            if (!key) return;

            const p = FlowerpotPresets[key];

            document.getElementById("mb_freq").value = p.frequency;
            document.getElementById("mb_coax").value = p.coaxType;
            document.getElementById("mb_pvc_od").value = p.pvcOD;
            document.getElementById("mb_pvc_mode").value = p.pvcMode;
            document.getElementById("mb_xl").value = p.targetReactance;
        };

        // Generate design
        document.getElementById("mb_generate").onclick = () => {

            const freq = Number(document.getElementById("mb_freq").value);
            const coax = document.getElementById("mb_coax").value;
            const pvcOD = Number(document.getElementById("mb_pvc_od").value);
            const pvcMode = document.getElementById("mb_pvc_mode").value;
            const targetXL = Number(document.getElementById("mb_xl").value);

            const config = {
                type: "flowerpot",
                frequency: freq * 1e6,
                coaxType: coax,
                pvcOD,
                pvcMode,
                targetReactance: targetXL
            };

            // Run simulation using existing engine
            this.app.runSimulation(config, "mb_output");
        };
    }
}

/* ============================================================
   Flowerpot (T2LT) Antenna — Printable Build Sheet Panel
   ============================================================ */

import { FlowerpotPresets } from "/ui/presets/flowerpot-presets.js";

export default class FlowerpotBuildSheetPanel {

    constructor(app) {
        this.app = app;
    }

    render() {
        return `
        <div class="antenna-panel buildsheet">
            <h2>Flowerpot (T2LT) — Printable Build Sheet</h2>

            <label>Select Band Preset</label>
            <select id="fp_bs_preset">
                <option value="">Choose…</option>
                <option value="2m">2m (146 MHz)</option>
                <option value="70cm">70cm (446 MHz)</option>
                <option value="6m">6m (52 MHz)</option>
                <option value="10m">10m (28.5 MHz)</option>
                <option value="gmrs">GMRS (462 MHz)</option>
                <option value="cb">CB (27 MHz)</option>
            </select>

            <button id="fp_bs_generate">Generate Build Sheet</button>

            <div id="fp_bs_output" class="buildsheet-output"></div>
        </div>
        `;
    }

    attachEvents() {

        document.getElementById("fp_bs_generate").onclick = () => {

            const key = document.getElementById("fp_bs_preset").value;
            if (!key) {
                document.getElementById("fp_bs_output").innerHTML =
                    "<p>Please select a preset.</p>";
                return;
            }

            const p = FlowerpotPresets[key];

            const sheet = `
                <h3>${p.label} — Build Sheet</h3>

                <p><b>Frequency:</b> ${p.frequency} MHz</p>
                <p><b>Coax Type:</b> ${p.coaxType}</p>
                <p><b>PVC Outside Diameter:</b> ${p.pvcOD} mm</p>
                <p><b>Mounting Mode:</b> ${p.pvcMode}</p>
                <p><b>Target Choke Reactance:</b> ${p.targetReactance} Ω</p>

                <h4>Cut Lengths (Approximate)</h4>
                <p>Use the simulation panel to compute exact lengths.</p>
                <ul>
                    <li><b>Top Radiator:</b> Half-wave × VF × PVC factor</li>
                    <li><b>Bottom Sleeve:</b> Same as top (Flowerpot is symmetric)</li>
                </ul>

                <h4>Choke Coil</h4>
                <ul>
                    <li>Wind coax tightly on PVC</li>
                    <li>Turns required: Computed automatically in simulation</li>
                    <li>Spacing: Touching turns preferred</li>
                </ul>

                <h4>Tuning Procedure</h4>
                <ol>
                    <li>Build antenna slightly long.</li>
                    <li>Use a NanoVNA to sweep the band.</li>
                    <li>Find the lowest SWR frequency.</li>
                    <li>If resonance is low, trim both elements.</li>
                    <li>Use ratio method:<br>
                        <code>Lnew = Lold × (f_current / f_target)</code>
                    </li>
                    <li>Trim in small increments.</li>
                    <li>Add choke turns if SWR shifts when touching coax.</li>
                </ol>

                <h4>Notes</h4>
                <ul>
                    <li>Keep coax feedline away from metal.</li>
                    <li>Mount vertically for best performance.</li>
                    <li>Use UV‑resistant PVC for outdoor installations.</li>
                </ul>
            `;

            document.getElementById("fp_bs_output").innerHTML = sheet;
        };
    }
}

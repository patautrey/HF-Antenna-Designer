/* ============================================================
   Flowerpot (T2LT) — Coax Loss Calculator
   ============================================================ */

export default class FlowerpotCoaxLossPanel {

    constructor(app) {
        this.app = app;
    }

    render() {
        return `
        <div class="antenna-panel">
            <h2>Flowerpot (T2LT) — Coax Loss Calculator</h2>

            <label>Frequency (MHz)</label>
            <input id="fp_cl_freq" type="number" value="146">

            <label>Coax Type</label>
            <select id="fp_cl_type">
                <option>RG58</option>
                <option>RG8X</option>
                <option>RG174</option>
                <option>LMR240</option>
                <option>LMR400</option>
                <option>RG6</option>
            </select>

            <label>Coax Length (meters)</label>
            <input id="fp_cl_len" type="number" value="10">

            <button id="fp_cl_run">Compute Loss</button>

            <div id="fp_cl_output"></div>
        </div>
        `;
    }

    attachEvents() {

        document.getElementById("fp_cl_run").onclick = () => {

            const freq = Number(document.getElementById("fp_cl_freq").value);
            const type = document.getElementById("fp_cl_type").value;
            const len = Number(document.getElementById("fp_cl_len").value);

            const loss = this.estimateLoss(type, freq, len);

            document.getElementById("fp_cl_output").innerHTML = `
                <h3>Coax Loss Summary</h3>
                <p><b>Total Loss:</b> ${loss.toFixed(2)} dB</p>
                <p><b>Power Delivered:</b> ${(100 * Math.pow(10, -loss / 10)).toFixed(1)}%</p>
            `;
        };
    }

    estimateLoss(type, freq, len) {
        const table = {
            "RG58": 0.64,
            "RG8X": 0.45,
            "RG174": 1.5,
            "LMR240": 0.26,
            "LMR400": 0.14,
            "RG6": 0.22
        };

        const base = table[type] || 0.6;
        return base * (freq / 100) * (len / 10);
    }
}

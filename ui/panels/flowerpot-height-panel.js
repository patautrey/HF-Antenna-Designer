/* ============================================================
   Flowerpot (T2LT) — Height vs Gain Optimizer
   ============================================================ */

export default class FlowerpotHeightPanel {

    constructor(app) {
        this.app = app;
    }

    render() {
        return `
        <div class="antenna-panel">
            <h2>Flowerpot (T2LT) — Height vs Gain Optimizer</h2>

            <label>Minimum Height (m)</label>
            <input id="fp_h_min" type="number" value="1">

            <label>Maximum Height (m)</label>
            <input id="fp_h_max" type="number" value="10">

            <label>Step (m)</label>
            <input id="fp_h_step" type="number" value="1">

            <button id="fp_h_run">Compute Gain Curve</button>

            <div id="fp_h_output"></div>
        </div>
        `;
    }

    attachEvents() {

        document.getElementById("fp_h_run").onclick = () => {

            const min = Number(document.getElementById("fp_h_min").value);
            const max = Number(document.getElementById("fp_h_max").value);
            const step = Number(document.getElementById("fp_h_step").value);

            let rows = "";
            for (let h = min; h <= max; h += step) {
                const gain = this.estimateGain(h);
                rows += `<tr><td>${h}</td><td>${gain.toFixed(2)} dBi</td></tr>`;
            }

            document.getElementById("fp_h_output").innerHTML = `
                <h3>Height vs Gain</h3>
                <table class="gain-table">
                    <tr><th>Height (m)</th><th>Estimated Gain</th></tr>
                    ${rows}
                </table>
            `;
        };
    }

    estimateGain(h) {
        if (h < 1) return -1;
        if (h < 2) return 0;
        if (h < 4) return 1;
        if (h < 8) return 2;
        return 3;
    }
}

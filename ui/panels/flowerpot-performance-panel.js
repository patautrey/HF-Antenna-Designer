/* ============================================================
   Flowerpot (T2LT) Antenna — Performance Analyzer Panel
   ============================================================ */

export default class FlowerpotPerformancePanel {

    constructor(app) {
        this.app = app;
    }

    render() {
        return `
        <div class="antenna-panel">
            <h2>Flowerpot (T2LT) — Performance Analyzer</h2>

            <label>Frequency (MHz)</label>
            <input id="fp_pa_freq" type="number" value="146">

            <label>Coax Type</label>
            <select id="fp_pa_coax">
                <option>RG58</option>
                <option>RG8X</option>
                <option>RG174</option>
                <option>LMR240</option>
                <option>LMR400</option>
                <option>RG6</option>
            </select>

            <label>PVC Outside Diameter (mm)</label>
            <input id="fp_pa_pvc_od" type="number" value="25">

            <label>Mounting Mode</label>
            <select id="fp_pa_pvc_mode">
                <option value="outside">Outside PVC</option>
                <option value="inside">Inside PVC</option>
            </select>

            <label>Target Choke Reactance (Ω)</label>
            <input id="fp_pa_xl" type="number" value="500">

            <button id="fp_pa_run">Analyze Performance</button>

            <div id="fp_pa_output"></div>
        </div>
        `;
    }

    attachEvents() {

        document.getElementById("fp_pa_run").onclick = () => {

            const config = {
                type: "flowerpot",
                frequency: Number(document.getElementById("fp_pa_freq").value) * 1e6,
                coaxType: document.getElementById("fp_pa_coax").value,
                pvcOD: Number(document.getElementById("fp_pa_pvc_od").value),
                pvcMode: document.getElementById("fp_pa_pvc_mode").value,
                targetReactance: Number(document.getElementById("fp_pa_xl").value)
            };

            this.app.runSimulation(config, "fp_pa_output", (result) => {

                const Z = result.impedance;
                const swr = result.swr;
                const pattern = result.pattern;

                const gain = pattern.maxGain || 0;
                const efficiency = pattern.efficiency || 0;

                const bandwidth = this.estimateBandwidth(swr);
                const chokeOK = result.metadata.chokeTurns >= 5;

                document.getElementById("fp_pa_output").innerHTML = `
                    <h3>Performance Summary</h3>

                    <p><b>Feedpoint Impedance:</b> ${Z.real.toFixed(1)} + j${Z.imag.toFixed(1)} Ω</p>
                    <p><b>SWR:</b> ${swr.toFixed(2)}</p>
                    <p><b>Max Gain:</b> ${gain.toFixed(2)} dBi</p>
                    <p><b>Efficiency:</b> ${(efficiency * 100).toFixed(1)}%</p>
                    <p><b>Estimated Bandwidth:</b> ${bandwidth.toFixed(1)} MHz</p>
                    <p><b>Choke Effectiveness:</b> ${chokeOK ? "Good" : "Needs More Turns"}</p>

                    <h4>Elevation Pattern Notes</h4>
                    <p>${this.describePattern(pattern)}</p>
                `;
            });
        };
    }

    estimateBandwidth(swr) {
        if (swr < 1.3) return 6;
        if (swr < 1.5) return 4;
        if (swr < 2.0) return 2;
        return 1;
    }

    describePattern(pattern) {
        if (!pattern || !pattern.elevation) return "Pattern data unavailable.";

        const peak = pattern.maxGain || 0;

        if (peak > 2) return "Strong low-angle radiation ideal for VHF/UHF.";
        if (peak > 1) return "Moderate low-angle radiation, typical for coaxial sleeves.";
        return "Low gain — check choke and element lengths.";
    }
}

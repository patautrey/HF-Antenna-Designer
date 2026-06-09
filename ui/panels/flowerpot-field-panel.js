/* ============================================================
   Flowerpot (T2LT) — Field Deployment Planner
   ============================================================ */

export default class FlowerpotFieldPanel {

    constructor(app) {
        this.app = app;
    }

    render() {
        return `
        <div class="antenna-panel">
            <h2>Flowerpot (T2LT) — Field Deployment Planner</h2>

            <label>Deployment Height (meters)</label>
            <input id="fp_fd_height" type="number" value="3">

            <label>Ground Type</label>
            <select id="fp_fd_ground">
                <option value="average">Average Soil</option>
                <option value="poor">Poor / Rocky</option>
                <option value="good">Good / Moist</option>
                <option value="urban">Urban / Concrete</option>
            </select>

            <label>Environment</label>
            <select id="fp_fd_env">
                <option value="open">Open Field</option>
                <option value="suburban">Suburban</option>
                <option value="urban">Urban</option>
                <option value="forest">Forest / Trees</option>
            </select>

            <button id="fp_fd_run">Analyze Deployment</button>

            <div id="fp_fd_output"></div>
        </div>
        `;
    }

    attachEvents() {

        document.getElementById("fp_fd_run").onclick = () => {

            const height = Number(document.getElementById("fp_fd_height").value);
            const ground = document.getElementById("fp_fd_ground").value;
            const env = document.getElementById("fp_fd_env").value;

            const heightGain = this.estimateHeightGain(height);
            const groundLoss = this.estimateGroundLoss(ground);
            const envLoss = this.estimateEnvLoss(env);

            const total = heightGain - groundLoss - envLoss;

            document.getElementById("fp_fd_output").innerHTML = `
                <h3>Deployment Summary</h3>

                <p><b>Height Gain:</b> +${heightGain.toFixed(1)} dB</p>
                <p><b>Ground Loss:</b> -${groundLoss.toFixed(1)} dB</p>
                <p><b>Environment Loss:</b> -${envLoss.toFixed(1)} dB</p>

                <h4>Estimated Net Performance</h4>
                <p><b>${total.toFixed(1)} dB</b> relative to ideal free‑space deployment</p>

                <h4>Notes</h4>
                <p>${this.describeEnvironment(env)}</p>
            `;
        };
    }

    estimateHeightGain(h) {
        if (h < 2) return 0.5;
        if (h < 4) return 1.0;
        if (h < 8) return 2.0;
        return 3.0;
    }

    estimateGroundLoss(g) {
        return {
            "poor": 2.0,
            "average": 1.0,
            "good": 0.5,
            "urban": 3.0
        }[g] || 1.0;
    }

    estimateEnvLoss(e) {
        return {
            "open": 0.0,
            "suburban": 1.0,
            "urban": 2.5,
            "forest": 3.0
        }[e] || 0.0;
    }

    describeEnvironment(e) {
        return {
            "open": "Excellent environment with minimal obstructions.",
            "suburban": "Moderate clutter; expect some diffraction loss.",
            "urban": "High clutter; reflections and absorption reduce range.",
            "forest": "Tree absorption significantly reduces VHF/UHF performance."
        }[e] || "";
    }
}

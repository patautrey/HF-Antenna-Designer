/* ============================================================
   HF Antenna Designer — Vertical Core Engine (Part 4)
   Final Render + Event Wiring + Integration
   ============================================================ */

import UIEngine from "./ui-engine.js";
import MathEngine from "./math-engine.js";
import ChartEngine from "./chart-engine.js";

const VerticalCore = {

    /* ------------------------------------------------------------
       1. VALIDATE INPUTS
       ------------------------------------------------------------ */
    validate(params) {
        if (isNaN(params.freq) || params.freq <= 0) return false;
        if (isNaN(params.height) || params.height <= 0) return false;
        if (isNaN(params.radialCount) || params.radialCount < 0) return false;
        if (isNaN(params.radialLength) || params.radialLength < 0) return false;
        return true;
    },

    /* ------------------------------------------------------------
       2. MAIN CALCULATION PIPELINE
       ------------------------------------------------------------ */
    calculate(params) {
        const Z = this.feedpoint(params);
        const swrData = this.swrData(params);
        const eff = this.efficiency(params);
        const toa = this.takeoffAngle(params);
        const gain = this.gain(params);

        return {
            impedance: Z,
            swr: swrData.swr,
            returnLoss: swrData.rl,
            efficiency: eff,
            takeoffAngle: toa,
            gain: gain
        };
    },

    /* ------------------------------------------------------------
       3. UPDATE METRIC CARDS
       ------------------------------------------------------------ */
    updateMetrics(container, results) {
        const metrics = document.createElement("div");
        metrics.style.display = "grid";
        metrics.style.gridTemplateColumns = "1fr 1fr 1fr 1fr";
        metrics.style.gap = "20px";
        metrics.style.marginTop = "20px";

        metrics.appendChild(
            UIEngine.metricCard("Feedpoint R (Ω)", results.impedance.R.toFixed(1))
        );
        metrics.appendChild(
            UIEngine.metricCard("Feedpoint X (Ω)", results.impedance.X.toFixed(1))
        );
        metrics.appendChild(
            UIEngine.metricCard("SWR", results.swr.toFixed(2))
        );
        metrics.appendChild(
            UIEngine.metricCard("Efficiency", (results.efficiency * 100).toFixed(1), "%")
        );
        metrics.appendChild(
            UIEngine.metricCard("TOA (°)", results.takeoffAngle.toFixed(1))
        );
        metrics.appendChild(
            UIEngine.metricCard("Gain (dBi)", results.gain.toFixed(2))
        );

        container.appendChild(metrics);
    },

    /* ------------------------------------------------------------
       4. HANDLE CALCULATE BUTTON
       ------------------------------------------------------------ */
    wireCalculate(container) {
        const btn = document.getElementById("calcVertical");

        btn.addEventListener("click", () => {
            const params = this.getParams();

            if (!this.validate(params)) {
                alert("Invalid input values.");
                return;
            }

            const results = this.calculate(params);

            this.renderCharts(params);

            const metricsContainer = document.createElement("div");
            this.updateMetrics(metricsContainer, results);

            container.appendChild(metricsContainer);
        });
    },

    /* ------------------------------------------------------------
       5. RENDER (FULL ENGINE)
       ------------------------------------------------------------ */
    render(container) {
        UIEngine.clear(container);

        const inputPanel = this.buildInputPanel();
        const outputPanels = this.buildOutputPanels();

        UIEngine.render(container, [
            inputPanel,
            ...outputPanels
        ]);

        this.wireCalculate(container);
    }
};

export default VerticalCore;

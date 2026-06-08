/* ============================================================
   HF Antenna Designer — Vertical Loaded Engine
   Base‑Loaded • Center‑Loaded • Top‑Loaded • Slinky
   ============================================================ */

import MathEngine from "./math-engine.js";
import VerticalCore from "./vertical-core.js";

const VerticalLoaded = {

    /* ------------------------------------------------------------
       1. COIL REACTANCE (XL)
       ------------------------------------------------------------ */
    coilReactance(freqMHz, inductance_uH) {
        const f = freqMHz * 1e6;
        const L = inductance_uH * 1e-6;
        return 2 * Math.PI * f * L;
    },

    /* ------------------------------------------------------------
       2. COIL LOSS RESISTANCE (Rloss)
       ------------------------------------------------------------ */
    coilLoss(freqMHz, inductance_uH, Q) {
        const XL = this.coilReactance(freqMHz, inductance_uH);
        return XL / Q;
    },

    /* ------------------------------------------------------------
       3. EFFECTIVE HEIGHT CORRECTION
       ------------------------------------------------------------ */
    effectiveHeight(params) {
        const { height, type } = params;

        if (type === "baseloaded") return height * 0.85;
        if (type === "centerloaded") return height * 0.92;
        if (type === "toploaded") return height * 0.97;
        if (type === "slinky") return height * 0.75;

        return height;
    },

    /* ------------------------------------------------------------
       4. RADIATION RESISTANCE (MODIFIED)
       ------------------------------------------------------------ */
    radiationResistance(params) {
        const hEff = this.effectiveHeight(params);
        return MathEngine.radiationResistance_vertical(hEff, params.freq);
    },

    /* ------------------------------------------------------------
       5. REACTANCE (MODIFIED)
       ------------------------------------------------------------ */
    reactance(params) {
        const { freq, inductance, type } = params;

        const XL = this.coilReactance(freq, inductance);

        if (type === "baseloaded") return XL * 1.0;
        if (type === "centerloaded") return XL * 0.5;
        if (type === "toploaded") return XL * 0.2;
        if (type === "slinky") return XL * 1.3;

        return XL;
    },

    /* ------------------------------------------------------------
       6. FEEDPOINT IMPEDANCE (OVERRIDE)
       ------------------------------------------------------------ */
    feedpoint(params) {
        const Rr = this.radiationResistance(params);
        const Rg = VerticalCore.groundLoss(params);

        const Rloss = this.coilLoss(params.freq, params.inductance, params.Q);

        const X = this.reactance(params);

        return {
            R: Rr + Rg + Rloss,
            X: X
        };
    },

    /* ------------------------------------------------------------
       7. CALCULATE (OVERRIDE)
       ------------------------------------------------------------ */
    calculate(params) {
        const Z = this.feedpoint(params);
        const swrData = VerticalCore.swrData({ ...params, feedOverride: Z });
        const eff = VerticalCore.efficiency(params);
        const toa = VerticalCore.takeoffAngle(params);
        const gain = VerticalCore.gain(params);

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
       8. RENDER CHARTS (USES CORE PATTERNS)
       ------------------------------------------------------------ */
    renderCharts(params) {
        VerticalCore.renderCharts(params);
    },

    /* ------------------------------------------------------------
       9. RENDER UI (EXTENDS CORE)
       ------------------------------------------------------------ */
    render(container) {
        VerticalCore.render(container);

        const panel = document.querySelector(".panel");

        const inductance = document.createElement("div");
        inductance.appendChild(
            (() => {
                const label = document.createElement("label");
                label.textContent = "Coil Inductance (uH)";
                const input = document.createElement("input");
                input.id = "inductance";
                input.type = "number";
                input.value = 20;
                input.step = "0.1";
                const wrap = document.createElement("div");
                wrap.appendChild(label);
                wrap.appendChild(input);
                return wrap;
            })()
        );

        const qfactor = document.createElement("div");
        qfactor.appendChild(
            (() => {
                const label = document.createElement("label");
                label.textContent = "Coil Q";
                const input = document.createElement("input");
                input.id = "Q";
                input.type = "number";
                input.value = 200;
                input.step = "1";
                const wrap = document.createElement("div");
                wrap.appendChild(label);
                wrap.appendChild(input);
                return wrap;
            })()
        );

        panel.appendChild(inductance);
        panel.appendChild(qfactor);

        const btn = document.getElementById("calcVertical");

        btn.addEventListener("click", () => {
            const params = VerticalCore.getParams();
            params.inductance = parseFloat(document.getElementById("inductance").value);
            params.Q = parseFloat(document.getElementById("Q").value);

            const results = this.calculate(params);

            this.renderCharts(params);

            const metricsContainer = document.createElement("div");
            VerticalCore.updateMetrics(metricsContainer, results);

            container.appendChild(metricsContainer);
        });
    }
};

export default VerticalLoaded;

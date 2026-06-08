/* ============================================================
   HF Antenna Designer — Vertical Core Engine (Part 2)
   Calculations + Ground + Radials + Impedance + Efficiency
   ============================================================ */

import MathEngine from "./math-engine.js";

const VerticalCore = {

    /* ------------------------------------------------------------
       1. GET BASIC PARAMETERS
       ------------------------------------------------------------ */
    getParams() {
        return {
            type: document.getElementById("verticalType").value,
            freq: parseFloat(document.getElementById("freq").value),
            height: parseFloat(document.getElementById("height").value),
            radialCount: parseInt(document.getElementById("radialCount").value),
            radialLength: parseFloat(document.getElementById("radialLength").value),
            groundType: document.getElementById("groundType").value,
            dxMode: document.getElementById("dxMode").value
        };
    },

    /* ------------------------------------------------------------
       2. RADIATION RESISTANCE
       ------------------------------------------------------------ */
    radiationResistance(params) {
        const { type, height, freq } = params;

        // Special cases
        if (type === "verticaldipole") return 73; // half-wave dipole vertical
        if (type === "fiveeighths") return 150;  // typical 5/8-wave Rr

        // Default vertical model
        return MathEngine.radiationResistance_vertical(height, freq);
    },

    /* ------------------------------------------------------------
       3. GROUND LOSS
       ------------------------------------------------------------ */
    groundLoss(params) {
        const { groundType, radialCount, radialLength, freq } = params;

        if (groundType === "seaside") return MathEngine.groundLoss_seaside();

        // Radial-based ground loss
        return MathEngine.groundLoss_radials(radialCount, radialLength, freq);
    },

    /* ------------------------------------------------------------
       4. REACTANCE MODEL
       ------------------------------------------------------------ */
    reactance(params) {
        const { type, height, freq } = params;
        const λ = MathEngine.wavelength(freq);
        const hλ = height / λ;

        // 1/4-wave vertical near resonance
        if (type === "quarter") {
            return 120 * (hλ - 0.25) * 100;
        }

        // 1/2-wave vertical (high reactance)
        if (type === "half") {
            return 800 * (hλ - 0.5);
        }

        // Default thin-wire approximation
        return 200 * (hλ - 0.25);
    },

    /* ------------------------------------------------------------
       5. FEEDPOINT IMPEDANCE
       ------------------------------------------------------------ */
    feedpoint(params) {
        const Rr = this.radiationResistance(params);
        const Rg = this.groundLoss(params);
        const X = this.reactance(params);

        return MathEngine.feedpointImpedance(Rr, Rg, X);
    },

    /* ------------------------------------------------------------
       6. SWR + RETURN LOSS
       ------------------------------------------------------------ */
    swrData(params) {
        const Z = this.feedpoint(params);
        return {
            swr: MathEngine.swr(Z),
            rl: MathEngine.returnLoss(Z)
        };
    },

    /* ------------------------------------------------------------
       7. EFFICIENCY
       ------------------------------------------------------------ */
    efficiency(params) {
        const Rr = this.radiationResistance(params);
        const Rg = this.groundLoss(params);

        return Rr / (Rr + Rg);
    },

    /* ------------------------------------------------------------
       8. TAKEOFF ANGLE (TOA)
       ------------------------------------------------------------ */
    takeoffAngle(params) {
        return MathEngine.takeoffAngle(params.freq, params.height);
    },

    /* ------------------------------------------------------------
       9. GAIN WITH GROUND
       ------------------------------------------------------------ */
    gain(params) {
        const baseGain = 1.5; // dBi typical for 1/4-wave

        const Rg = this.groundLoss(params);
        return MathEngine.gainWithGround(baseGain, Rg);
    }
};

export default VerticalCore;

/* ============================================================
   HF Antenna Designer — Vertical Core Engine (Part 3)
   Pattern Generation + Chart Integration (Precision Mode)
   ============================================================ */

import MathEngine from "./math-engine.js";
import ChartEngine from "./chart-engine.js";

const VerticalCore = {

    /* ------------------------------------------------------------
       1. PRECISION AZIMUTH PATTERN (H-plane)
       ------------------------------------------------------------ */
    azimuthPattern(params) {
        const angles = [];
        const gain = [];

        const { freq, height } = params;
        const λ = MathEngine.wavelength(freq);
        const k = (2 * Math.PI) / λ;

        for (let deg = 0; deg <= 360; deg += 2) {
            const θ = Math.PI / 2; // horizontal cut
            const φ = deg * (Math.PI / 180);

            const Eθ = Math.cos(k * height * Math.cos(θ));
            const Eφ = 0;

            const E = Math.sqrt(Eθ * Eθ + Eφ * Eφ);

            angles.push(deg);
            gain.push(20 * Math.log10(Math.abs(E) + 1e-9));
        }

        return { angles, gain };
    },

    /* ------------------------------------------------------------
       2. PRECISION ELEVATION PATTERN (E-plane)
       ------------------------------------------------------------ */
    elevationPattern(params) {
        const angles = [];
        const gain = [];

        const { freq, height } = params;
        const λ = MathEngine.wavelength(freq);
        const k = (2 * Math.PI) / λ;

        for (let deg = 0; deg <= 90; deg += 1) {
            const θ = deg * (Math.PI / 180);
            const φ = 0;

            const Eθ = Math.cos(k * height * Math.cos(θ));
            const Eφ = 0;

            const E = Math.sqrt(Eθ * Eθ + Eφ * Eφ);

            angles.push(deg);
            gain.push(20 * Math.log10(Math.abs(E) + 1e-9));
        }

        return { angles, gain };
    },

    /* ------------------------------------------------------------
       3. 3D RADIATION PATTERN (Precision Mode)
       ------------------------------------------------------------ */
    pattern3D(params) {
        const { freq, height } = params;
        const λ = MathEngine.wavelength(freq);
        const k = (2 * Math.PI) / λ;

        const size = 60;
        const x = [];
        const y = [];
        const z = [];

        for (let i = 0; i < size; i++) {
            const rowX = [];
            const rowY = [];
            const rowZ = [];

            const θ = (i / (size - 1)) * Math.PI;

            for (let j = 0; j < size; j++) {
                const φ = (j / (size - 1)) * 2 * Math.PI;

                const Eθ = Math.cos(k * height * Math.cos(θ));
                const Eφ = 0;

                const E = Math.sqrt(Eθ * Eθ + Eφ * Eφ);

                const r = Math.abs(E);

                rowX.push(r * Math.sin(θ) * Math.cos(φ));
                rowY.push(r * Math.sin(θ) * Math.sin(φ));
                rowZ.push(r * Math.cos(θ));
            }

            x.push(rowX);
            y.push(rowY);
            z.push(rowZ);
        }

        return { x, y, z };
    },

    /* ------------------------------------------------------------
       4. SWR SWEEP
       ------------------------------------------------------------ */
    swrSweep(params) {
        const freq = params.freq;
        const sweep = [];
        const swr = [];

        for (let f = freq - 0.5; f <= freq + 0.5; f += 0.02) {
            const p = { ...params, freq: f };
            const Z = this.feedpoint(p);
            sweep.push(f);
            swr.push(MathEngine.swr(Z));
        }

        return { frequency: sweep, swr };
    },

    /* ------------------------------------------------------------
       5. CURRENT DISTRIBUTION
       ------------------------------------------------------------ */
    currentDistribution(params) {
        const segments = 40;
        const arr = MathEngine.currentDistribution_vertical(
            params.height,
            params.freq,
            segments
        );

        const elements = [];
        for (let i = 0; i < segments; i++) {
            elements.push(i + 1);
        }

        return { elements, current: arr };
    },

    /* ------------------------------------------------------------
       6. RENDER ALL CHARTS
       ------------------------------------------------------------ */
    renderCharts(params) {
        const az = this.azimuthPattern(params);
        ChartEngine.azimuth("azimuthPlot", az);

        const el = this.elevationPattern(params);
        ChartEngine.elevation("elevationPlot", el);

        const sw = this.swrSweep(params);
        ChartEngine.swrCurve("swrPlot", sw);

        const cd = this.currentDistribution(params);
        ChartEngine.currentDistribution("currentPlot", cd);
    }
};

export default VerticalCore;

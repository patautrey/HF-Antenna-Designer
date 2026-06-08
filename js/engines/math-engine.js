/* ============================================================
   HF Antenna Designer — NEC‑Style Math Engine
   Light Theme • Engineering White‑Paper Style
   ============================================================ */

const MathEngine = {

    /* ------------------------------------------------------------
       1. BASIC RF CONSTANTS
       ------------------------------------------------------------ */
    C: 299.792458, // speed of light (m/µs)

    /* ------------------------------------------------------------
       2. WAVELENGTH CALCULATIONS
       ------------------------------------------------------------ */
    wavelength(freqMHz) {
        return this.C / freqMHz; // meters
    },

    k(freqMHz) {
        return (2 * Math.PI) / this.wavelength(freqMHz);
    },

    /* ------------------------------------------------------------
       3. RADIATION RESISTANCE MODELS
       ------------------------------------------------------------ */
    radiationResistance_vertical(height_m, freqMHz) {
        const λ = this.wavelength(freqMHz);
        const hλ = height_m / λ;

        // NEC-style approximation for short verticals
        return 160 * Math.pow(hλ, 2);
    },

    radiationResistance_dipole(freqMHz, length_m) {
        const λ = this.wavelength(freqMHz);
        const Lλ = length_m / λ;

        // Half-wave dipole NEC approximation
        if (Math.abs(Lλ - 0.5) < 0.1) return 73;

        // General thin-wire dipole approximation
        return 80 * Math.pow(Math.PI * Lλ, 2);
    },

    /* ------------------------------------------------------------
       4. GROUND LOSS MODELS
       ------------------------------------------------------------ */
    groundLoss_radials(radialCount, radialLength_m, freqMHz) {
        const λ = this.wavelength(freqMHz);
        const Lλ = radialLength_m / λ;

        // Brown, Lewis & Epstein approximation
        const baseLoss = 5 / Math.sqrt(radialCount);
        const lengthFactor = 1 / (1 + 3 * Lλ);

        return baseLoss * lengthFactor; // ohms
    },

    groundLoss_seaside() {
        return 0.1; // extremely low loss
    },

    /* ------------------------------------------------------------
       5. FEEDPOINT IMPEDANCE
       ------------------------------------------------------------ */
    feedpointImpedance(Rr, Rg, X) {
        return {
            R: Rr + Rg,
            X: X
        };
    },

    /* ------------------------------------------------------------
       6. SWR & RETURN LOSS
       ------------------------------------------------------------ */
    swr(Z, Z0 = 50) {
        const Γ = Math.sqrt(
            Math.pow((Z.R - Z0), 2) + Math.pow(Z.X, 2)
        ) / Math.sqrt(
            Math.pow((Z.R + Z0), 2) + Math.pow(Z.X, 2)
        );

        return (1 + Γ) / (1 - Γ);
    },

    returnLoss(Z, Z0 = 50) {
        const Γ = Math.sqrt(
            Math.pow((Z.R - Z0), 2) + Math.pow(Z.X, 2)
        ) / Math.sqrt(
            Math.pow((Z.R + Z0), 2) + Math.pow(Z.X, 2)
        );

        return -20 * Math.log10(Γ);
    },

    /* ------------------------------------------------------------
       7. BANDWIDTH ESTIMATION
       ------------------------------------------------------------ */
    bandwidth(freqMHz, Q) {
        const f = freqMHz;
        return {
            bw_2to1: f / Q,
            bw_3to1: 1.5 * (f / Q)
        };
    },

    /* ------------------------------------------------------------
       8. MUTUAL COUPLING (YAGI / ARRAYS)
       ------------------------------------------------------------ */
    mutualCoupling(distance_m, freqMHz) {
        const k = this.k(freqMHz);
        return Math.exp(-k * distance_m) * Math.cos(k * distance_m);
    },

    /* ------------------------------------------------------------
       9. CURRENT DISTRIBUTION
       ------------------------------------------------------------ */
    currentDistribution_dipole(segments) {
        const arr = [];
        for (let i = 0; i < segments; i++) {
            const x = (i / (segments - 1)) * Math.PI;
            arr.push(Math.sin(x)); // sinusoidal NEC approximation
        }
        return arr;
    },

    currentDistribution_vertical(height_m, freqMHz, segments) {
        const λ = this.wavelength(freqMHz);
        const hλ = height_m / λ;

        const arr = [];
        for (let i = 0; i < segments; i++) {
            const pos = i / (segments - 1);
            arr.push(Math.sin(Math.PI * hλ * pos));
        }
        return arr;
    },

    /* ------------------------------------------------------------
       10. GROUND REFLECTION / TOA
       ------------------------------------------------------------ */
    takeoffAngle(freqMHz, height_m) {
        const λ = this.wavelength(freqMHz);
        const hλ = height_m / λ;

        // NEC-style approximation for verticals
        return Math.max(5, 90 * Math.exp(-3 * hλ));
    },

    gainWithGround(gain_dBi, groundLoss_ohms) {
        const loss_dB = 10 * Math.log10(1 + groundLoss_ohms / 36);
        return gain_dBi - loss_dB;
    },

    /* ------------------------------------------------------------
       11. ERP CALCULATIONS
       ------------------------------------------------------------ */
    erp(powerW, efficiency, gain_dBi) {
        const gainLinear = Math.pow(10, gain_dBi / 10);
        return powerW * efficiency * gainLinear;
    }
};

export default MathEngine;

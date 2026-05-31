/* ---------------------------------------------------------
   HF Workbench — GeometryEngine
   Handles electrical length, TOA, and efficiency modifiers
   from: height, DX Turbo, foldover, linear loading,
   loading coil, capacitance hat.
--------------------------------------------------------- */

export const GeometryEngine = {
    computeGeometry(params) {
        const {
            freqMHz,
            heightM,
            dxTurbo = false,

            // Foldover
            foldoverEnabled = false,
            foldAngleDeg = 0, // 0–60

            // Linear loading
            linearLoadingEnabled = false,
            linearLoadingFactor = 0, // 0–0.4 (fractional extra length)

            // Loading coil
            coilEnabled = false,
            coilPosition = "base", // "base" | "mid" | "top"
            coilQ = 200,

            // Capacitance hat
            hatEnabled = false,
            hatRadiusM = 0,
            hatSpokes = 0
        } = params;

        const lambda = 300 / freqMHz;

        // --- Base electrical height ---
        let effectiveHeight = heightM;

        // DX Turbo: force ~0.70 λ electrical height
        let dxTurboNote = null;
        if (dxTurbo) {
            effectiveHeight = 0.70 * lambda;
            dxTurboNote = "DX Turbo: electrical height forced to 0.70 λ.";
        }

        // --- Foldover ---
        let foldoverPenalty = 0;
        let foldoverNote = null;
        if (foldoverEnabled && foldAngleDeg > 0) {
            const angle = Math.max(0, Math.min(60, foldAngleDeg));
            const extraFraction = Math.sin((angle * Math.PI) / 180) * 0.25;
            effectiveHeight *= 1 + extraFraction;

            foldoverPenalty = -0.2 - (angle / 60) * 0.6; // –0.2 to –0.8 dB
            foldoverNote = `Foldover: ${angle.toFixed(0)}° bend, small efficiency penalty.`;
        }

        // --- Linear loading ---
        let linearPenalty = 0;
        let linearNote = null;
        if (linearLoadingEnabled && linearLoadingFactor > 0) {
            const factor = Math.max(0, Math.min(0.4, linearLoadingFactor));
            effectiveHeight *= 1 + factor;

            linearPenalty = -0.1 - factor * 0.3; // –0.1 to –0.22 dB typical
            linearNote = `Linear loading: effective length +${(factor * 100).toFixed(0)}%, small loss penalty.`;
        }

        // --- Loading coil ---
        let coilPenalty = 0;
        let coilNote = null;
        if (coilEnabled) {
            let lossFactor = 1.0;
            if (coilPosition === "base") lossFactor = 1.0;
            else if (coilPosition === "mid") lossFactor = 0.7;
            else if (coilPosition === "top") lossFactor = 0.4;

            const q = Math.max(50, Math.min(400, coilQ));
            const baseLoss = 1.5 / (q / 100); // rough scaling
            coilPenalty = -baseLoss * lossFactor; // –0.2 to –1.5 dB typical

            coilNote = `Loading coil: ${coilPosition} position, Q≈${q}, efficiency penalty ≈ ${coilPenalty.toFixed(1)} dB.`;
        }

        // --- Capacitance hat ---
        let hatBonus = 0;
        let hatNote = null;
        if (hatEnabled && hatRadiusM > 0 && hatSpokes > 0) {
            const radiusFrac = Math.min(0.25, hatRadiusM / lambda);
            const spokeFactor = Math.min(8, hatSpokes) / 8;
            const hatEffect = radiusFrac * spokeFactor;

            effectiveHeight *= 1 + hatEffect * 0.4;
            hatBonus = 0.2 + hatEffect * 1.0; // +0.2 to +0.6 dB typical

            hatNote = `Capacitance hat: radius=${hatRadiusM.toFixed(1)} m, spokes=${hatSpokes}, efficiency boost ≈ ${hatBonus.toFixed(1)} dB.`;
        }

        // --- Final electrical fraction and TOA estimate ---
        const frac = effectiveHeight / lambda;

        let toa = 80 - frac * 140;
        toa = Math.min(80, Math.max(10, toa));

        const totalGeomGainDelta = foldoverPenalty + linearPenalty + coilPenalty + hatBonus;

        const components = [];
        if (dxTurboNote) components.push({ type: "dxTurbo", note: dxTurboNote });
        if (foldoverNote) components.push({ type: "foldover", gainDelta: foldoverPenalty, note: foldoverNote });
        if (linearNote) components.push({ type: "linearLoading", gainDelta: linearPenalty, note: linearNote });
        if (coilNote) components.push({ type: "coil", gainDelta: coilPenalty, note: coilNote });
        if (hatNote) components.push({ type: "hat", gainDelta: hatBonus, note: hatNote });

        return {
            lambda,
            effectiveHeight,
            frac,
            toa,
            totalGeomGainDelta,
            components
        };
    }
};

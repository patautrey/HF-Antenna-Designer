/* ============================================================
   HF Antenna Designer — Module: Inverted‑L Antenna
   ============================================================ */

export default {

    name: "Inverted‑L Antenna",

    async init(container) {
        const engine = await import("/engines/inverted-l.js");

        if (!engine || !engine.default) {
            console.error("Inverted‑L engine missing");
            return;
        }

        const InvL = engine.default;

        const defaults = {
            frequency: 3.5,                 // MHz (80m baseline)
            verticalLength: 12.0,           // meters
            horizontalLength: 18.0,         // meters
            wireDiameter: 0.003,            // 12 AWG
            feedImpedance: 50,
            radialCount: 32,
            radialLength: 10.0,
            mountingMethod: "ground-mounted",
            orientation: 0,
            groundType: "poor",

            // Inverted‑L modeling
            includeGroundLoss: true,
            includeCurrentDistribution: true,
            includeEndEffects: true,
            calculateImpedance: true,
            calculateEfficiency: true,
            calculatePattern: true
        };

        InvL.render(container, defaults);
    }
};

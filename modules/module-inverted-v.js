/* ============================================================
   HF Antenna Designer — Module: Inverted‑V Dipole
   ============================================================ */

export default {

    name: "Inverted‑V Dipole",

    async init(container) {
        const engine = await import("/engines/inverted-v.js");

        if (!engine || !engine.default) {
            console.error("Inverted‑V engine missing");
            return;
        }

        const InvV = engine.default;

        const defaults = {
            frequency: 7.1,                 // MHz (40m baseline)
            totalLength: 20.0,              // meters (full dipole length)
            apexHeight: 10.0,               // meters
            legAngle: 120,                  // degrees between legs
            wireDiameter: 0.002,            // 14 AWG
            feedImpedance: 50,
            orientation: 0,
            groundType: "medium",

            // Inverted‑V modeling
            includeHeightEffects: true,
            includeEndEffects: true,
            includeLegAngleEffects: true,
            calculatePattern: true,
            calculateImpedance: true,
            calculateSWR: true
        };

        InvV.render(container, defaults);
    }
};

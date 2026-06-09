/* ============================================================
   HF Antenna Designer — Module: G5RV
   ============================================================ */

export default {

    name: "G5RV Antenna",

    async init(container) {
        const engine = await import("/engines/g5rv.js");

        if (!engine || !engine.default) {
            console.error("G5RV engine missing");
            return;
        }

        const G5RV = engine.default;

        const defaults = {
            frequency: 7.1,                 // MHz (40m baseline)
            topLength: 31.1,                // meters (102 ft total)
            matchingSectionLength: 10.36,   // meters (34 ft 450Ω ladder line)
            matchingSectionImpedance: 450,  // ohms
            feedImpedance: 50,              // coax to shack
            height: 12.0,                   // meters above ground
            configuration: "horizontal",    // horizontal, inverted-V, sloper
            tunerRequired: true,
            orientation: 0,
            groundType: "medium",

            // Modeling specifics
            includeLadderLineTransform: true,
            includeCoaxLosses: true,
            includeHeightEffects: true,
            calculateSWR: true,
            calculatePattern: true
        };

        G5RV.render(container, defaults);
    }
};

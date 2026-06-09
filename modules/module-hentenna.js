/* ============================================================
   HF Antenna Designer — Module: Hentenna
   ============================================================ */

export default {

    name: "Hentenna",

    async init(container) {
        const engine = await import("/engines/hentenna.js");

        if (!engine || !engine.default) {
            console.error("Hentenna engine missing");
            return;
        }

        const Hentenna = engine.default;

        const defaults = {
            frequency: 50.1,                // MHz (6m baseline)
            height: 3.0,                    // meters (vertical dimension)
            width: 1.0,                     // meters (horizontal dimension)
            feedpointOffset: 0.25,          // fraction of height from bottom
            wireDiameter: 0.003,            // 12 AWG
            mountingMethod: "vertical",
            mountingHeight: 6.0,
            orientation: 0,
            groundType: "medium",

            // Hentenna-specific modeling
            includeCurrentDistribution: true,
            includeEndEffects: true,
            calculateImpedance: true,
            calculatePattern: true,
            calculateGain: true
        };

        Hentenna.render(container, defaults);
    }
};

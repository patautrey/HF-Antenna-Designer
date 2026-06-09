/* ============================================================
   HF Antenna Designer — Module: Elpa 301
   ============================================================ */

export default {

    name: "Elpa 301",

    async init(container) {
        const engine = await import("/engines/elpa-301.js");

        if (!engine || !engine.default) {
            console.error("Elpa 301 engine missing");
            return;
        }

        const Elpa301 = engine.default;

        const defaults = {
            frequency: 3.5,                 // MHz (80m baseline)
            elementLength: 20.0,            // meters per element
            spacing: 0.5,                   // meters between elements
            numberOfElements: 3,            // classic Elpa 301 configuration
            feedImpedance: 50,              // ohms
            mountingMethod: "horizontal",
            mountingHeight: 12.0,
            orientation: 0,
            groundType: "medium",

            // Elpa-specific modeling
            includeMutualCoupling: true,
            includeEndEffects: true,
            calculateGain: true,
            calculateFrontToBack: true
        };

        Elpa301.render(container, defaults);
    }
};

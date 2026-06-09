/* ============================================================
   HF Antenna Designer — Module: Gotham Vertical
   ============================================================ */

export default {

    name: "Gotham Vertical",

    async init(container) {
        const engine = await import("/engines/gotham-vertical.js");

        if (!engine || !engine.default) {
            console.error("Gotham Vertical engine missing");
            return;
        }

        const Gotham = engine.default;

        const defaults = {
            frequency: 7.1,                 // MHz (40m baseline)
            mastHeight: 6.0,                // meters
            coilPosition: 3.0,              // meters above base
            coilInductance: 45e-6,          // 45 µH loading coil
            wireDiameter: 0.003,            // 12 AWG
            radialCount: 16,                // number of radials
            radialLength: 10.0,             // meters
            feedImpedance: 50,
            mountingMethod: "ground-mounted",
            orientation: 0,
            groundType: "poor",

            // Gotham-specific modeling
            includeLoadingCoilLoss: true,
            includeGroundLoss: true,
            includeCurrentDistribution: true,
            calculateEfficiency: true,
            calculateSWR: true
        };

        Gotham.render(container, defaults);
    }
};

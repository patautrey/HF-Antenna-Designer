/* ============================================================
   HF Antenna Designer — Module: Horizontal Loop (Skywire)
   ============================================================ */

export default {

    name: "Horizontal Loop",

    async init(container) {
        const engine = await import("/engines/horizontal-loop.js");

        if (!engine || !engine.default) {
            console.error("Horizontal Loop engine missing");
            return;
        }

        const HLoop = engine.default;

        const defaults = {
            frequency: 3.8,                 // MHz (80m baseline)
            loopPerimeter: 84.0,            // meters (~275 ft classic)
            shape: "square",                // square, triangle, irregular
            wireDiameter: 0.003,            // 12 AWG
            feedpointLocation: "corner",    // corner or midpoint
            feedlineType: "ladder-line",    // ladder-line or coax
            mountingHeight: 12.0,           // meters
            orientation: 0,
            groundType: "medium",

            // Loop-specific modeling
            includePerimeterResonance: true,
            includeHeightEffects: true,
            calculatePattern: true,
            calculateImpedance: true,
            calculateSWR: true
        };

        HLoop.render(container, defaults);
    }
};

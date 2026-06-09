/* ============================================================
   HF Antenna Designer — Module: Beverage Antenna
   ============================================================ */

export default {

    name: "Beverage Antenna",

    async init(container) {
        const engine = await import("/engines/beverage.js");

        if (!engine || !engine.default) {
            console.error("Beverage Antenna engine missing");
            return;
        }

        const Beverage = engine.default;

        const defaults = {
            frequency: 3.5,                 // MHz (80m typical)
            wireLength: 160,                // meters (1–2 wavelengths typical)
            wireHeight: 2.5,                // meters above ground
            terminationResistance: 470,     // ohms typical
            groundConductivity: "medium",   // poor, medium, good
            direction: 0,                   // azimuth
            mountingMethod: "end-supported",
            orientation: 0
        };

        Beverage.render(container, defaults);
    }
};

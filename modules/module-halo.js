/* ============================================================
   HF Antenna Designer — Module: Halo Antenna
   ============================================================ */

export default {

    name: "Halo Antenna",

    async init(container) {
        const engine = await import("/engines/halo.js");

        if (!engine || !engine.default) {
            console.error("Halo Antenna engine missing");
            return;
        }

        const Halo = engine.default;

        const defaults = {
            frequency: 144.2,               // MHz (2m typical)
            loopDiameter: 0.33,             // meters
            conductorDiameter: 0.01,        // meters
            gammaMatchLength: 0.05,         // meters
            feedImpedance: 50,              // ohms
            mountingMethod: "horizontal",   // horizontal omni
            mountingHeight: 3.0,
            orientation: 0,
            groundType: "none"
        };

        Halo.render(container, defaults);
    }
};

/* ============================================================
   HF Antenna Designer — Module: Discone Antenna
   ============================================================ */

export default {

    name: "Discone Antenna",

    async init(container) {
        const engine = await import("/engines/discone.js");

        if (!engine || !engine.default) {
            console.error("Discone Antenna engine missing");
            return;
        }

        const Discone = engine.default;

        const defaults = {
            frequency: 150.0,               // MHz baseline (VHF typical)
            discDiameter: 0.5,              // meters
            coneLength: 0.6,                // meters
            coneAngle: 60,                  // degrees
            elementCount: 8,                // number of cone radials
            feedImpedance: 50,              // ohms
            bandwidthRatio: 3.0,            // wideband capability
            mountingMethod: "vertical",     // vertical omni
            mountingHeight: 3.0,
            orientation: 0,
            groundType: "none"
        };

        Discone.render(container, defaults);
    }
};

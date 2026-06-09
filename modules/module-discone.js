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
            frequency: 150.0,
            discDiameter: 0.5,
            coneLength: 0.6,
            coneAngle: 60,
            elementCount: 8,
            feedImpedance: 50,
            bandwidthRatio: 3.0,
            mountingMethod: "vertical",
            mountingHeight: 3.0,
            orientation: 0,
            groundType: "none"
        };

        Discone.render(container, defaults);
    }
};

/* ============================================================
   HF Antenna Designer — Module: Vertical Discone
   ============================================================ */

export default {

    name: "Vertical Discone",

    async init(container) {
        const engine = await import("/engines/vertical-discone.js");

        if (!engine || !engine.default) {
            console.error("Vertical Discone engine missing");
            return;
        }

        const Discone = engine.default;

        const defaults = {
            frequency: 14.2,
            coneHeight: 2.5,
            coneRadius: 1.2,
            discRadius: 0.9,
            radialCount: 8,
            wireGauge: 14,
            mountingHeight: 3.0,
            groundType: "medium"
        };

        Discone.render(container, defaults);
    }
};

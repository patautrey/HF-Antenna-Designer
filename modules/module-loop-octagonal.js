/* ============================================================
   HF Antenna Designer — Module: Octagonal Loop
   ============================================================ */

export default {

    name: "Octagonal Loop",

    async init(container) {
        const engine = await import("/engines/loop-octagonal.js");

        if (!engine || !engine.default) {
            console.error("Octagonal Loop engine missing");
            return;
        }

        const OctLoop = engine.default;

        const defaults = {
            frequency: 14.2,
            sideLength: 4.8,
            height: 10.0,
            wireGauge: 14,
            feedPoint: "bottom",
            groundType: "medium"
        };

        OctLoop.render(container, defaults);
    }
};

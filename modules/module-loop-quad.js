/* ============================================================
   HF Antenna Designer — Module: Quad Loop
   ============================================================ */

export default {

    name: "Quad Loop",

    async init(container) {
        const engine = await import("/engines/loop-quad.js");

        if (!engine || !engine.default) {
            console.error("Quad Loop engine missing");
            return;
        }

        const QuadLoop = engine.default;

        const defaults = {
            frequency: 14.2,
            sideLength: 5.3,
            height: 10.0,
            wireGauge: 14,
            feedPoint: "bottom",
            groundType: "medium"
        };

        QuadLoop.render(container, defaults);
    }
};

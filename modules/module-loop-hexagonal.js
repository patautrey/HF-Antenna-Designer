/* ============================================================
   HF Antenna Designer — Module: Hexagonal Loop
   ============================================================ */

export default {

    name: "Hexagonal Loop",

    async init(container) {
        const engine = await import("/engines/loop-hexagonal.js");

        if (!engine || !engine.default) {
            console.error("Hexagonal Loop engine missing");
            return;
        }

        const HexLoop = engine.default;

        const defaults = {
            frequency: 14.2,
            sideLength: 6.0,
            height: 10.0,
            wireGauge: 14,
            feedPoint: "bottom",
            groundType: "medium"
        };

        HexLoop.render(container, defaults);
    }
};

/* ============================================================
   HF Antenna Designer — Module: Horizontal Loop
   ============================================================ */

export default {

    name: "Horizontal Loop",

    async init(container) {
        const engine = await import("/engines/loop-horizontal.js");

        if (!engine || !engine.default) {
            console.error("Horizontal Loop engine missing");
            return;
        }

        const HorizontalLoop = engine.default;

        const defaults = {
            frequency: 14.2,
            perimeter: 42.0,
            height: 10.0,
            shape: "square",
            wireGauge: 14,
            feedImpedance: 100,
            groundType: "medium"
        };

        HorizontalLoop.render(container, defaults);
    }
};

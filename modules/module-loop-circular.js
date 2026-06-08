/* ============================================================
   HF Antenna Designer — Module: Circular Loop
   ============================================================ */

export default {

    name: "Circular Loop",

    async init(container) {
        const engine = await import("/engines/loop-circular.js");

        if (!engine || !engine.default) {
            console.error("Circular Loop engine missing");
            return;
        }

        const CircularLoop = engine.default;

        const defaults = {
            frequency: 14.2,
            diameter: 13.0,
            height: 10.0,
            wireGauge: 14,
            feedPoint: "bottom",
            groundType: "medium"
        };

        CircularLoop.render(container, defaults);
    }
};

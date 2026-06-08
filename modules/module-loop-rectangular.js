/* ============================================================
   HF Antenna Designer — Module: Rectangular Loop
   ============================================================ */

export default {

    name: "Rectangular Loop",

    async init(container) {
        const engine = await import("/engines/loop-rectangular.js");

        if (!engine || !engine.default) {
            console.error("Rectangular Loop engine missing");
            return;
        }

        const RectangularLoop = engine.default;

        const defaults = {
            frequency: 14.2,
            width: 12.0,
            height: 8.0,
            loopHeight: 10.0,
            wireGauge: 14,
            feedPoint: "bottom-center",
            groundType: "medium"
        };

        RectangularLoop.render(container, defaults);
    }
};

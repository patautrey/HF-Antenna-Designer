/* ============================================================
   HF Antenna Designer — Module: Delta Loop
   ============================================================ */

export default {

    name: "Delta Loop",

    async init(container) {
        const engine = await import("/engines/loop-delta.js");

        if (!engine || !engine.default) {
            console.error("Delta Loop engine missing");
            return;
        }

        const DeltaLoop = engine.default;

        const defaults = {
            frequency: 14.2,
            perimeter: 42.0,
            orientation: "point-up",
            apexHeight: 12.0,
            baseHeight: 3.0,
            wireGauge: 14,
            feedPoint: "side",
            groundType: "medium"
        };

        DeltaLoop.render(container, defaults);
    }
};

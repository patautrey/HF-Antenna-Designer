/* ============================================================
   HF Antenna Designer — Module: 3‑Element Phased Vertical Array
   ============================================================ */

export default {

    name: "3‑Element Phased Array",

    async init(container) {
        const engine = await import("/engines/vertical-phased3.js");

        if (!engine || !engine.default) {
            console.error("3‑Element Phased Array engine missing");
            return;
        }

        const Phased3 = engine.default;

        const defaults = {
            frequency: 14.2,
            spacingFront: 0.20,
            spacingRear: 0.25,
            phaseFront: 90,
            phaseRear: -90,
            height: 5.0,
            groundType: "medium",
            radialCount: 16,
            radialLength: 5.0
        };

        Phased3.render(container, defaults);
    }
};

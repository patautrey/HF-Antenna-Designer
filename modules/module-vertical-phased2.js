/* ============================================================
   HF Antenna Designer — Module: 2‑Element Phased Vertical Array
   ============================================================ */

export default {

    name: "2‑Element Phased Array",

    async init(container) {
        const engine = await import("/engines/vertical-phased2.js");

        if (!engine || !engine.default) {
            console.error("2‑Element Phased Array engine missing");
            return;
        }

        const Phased2 = engine.default;

        const defaults = {
            frequency: 14.2,
            spacing: 0.25,
            phaseShift: 90,
            height: 5.0,
            groundType: "medium",
            radialCount: 16,
            radialLength: 5.0
        };

        Phased2.render(container, defaults);
    }
};

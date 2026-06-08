/* ============================================================
   HF Antenna Designer — Module: 4‑Element Phased Vertical Array
   ============================================================ */

export default {

    name: "4‑Element Phased Array",

    async init(container) {
        const engine = await import("/engines/vertical-phased4.js");

        if (!engine || !engine.default) {
            console.error("4‑Element Phased Array engine missing");
            return;
        }

        const Phased4 = engine.default;

        const defaults = {
            frequency: 14.2,
            spacing: 0.25,
            phaseNE: 90,
            phaseNW: -90,
            phaseSE: 90,
            phaseSW: -90,
            height: 5.0,
            groundType: "medium",
            radialCount: 16,
            radialLength: 5.0
        };

        Phased4.render(container, defaults);
    }
};

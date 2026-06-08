/* ============================================================
   HF Antenna Designer — Module: Quarter‑Wave Vertical
   ============================================================ */

export default {

    name: "Quarter‑Wave Vertical",

    async init(container) {
        const engine = await import("/engines/vertical-core.js");

        if (!engine || !engine.default) {
            console.error("Quarter‑Wave engine missing");
            return;
        }

        const VerticalCore = engine.default;

        const defaults = {
            frequency: 14.2,
            height: 5.0,
            groundType: "medium",
            radialCount: 16,
            radialLength: 5.0
        };

        VerticalCore.render(container, defaults);
    }
};

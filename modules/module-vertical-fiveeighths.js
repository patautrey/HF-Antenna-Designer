/* ============================================================
   HF Antenna Designer — Module: 5/8‑Wave Vertical
   ============================================================ */

export default {

    name: "5/8‑Wave Vertical",

    async init(container) {
        const engine = await import("/engines/vertical-core.js");

        if (!engine || !engine.default) {
            console.error("5/8‑Wave engine missing");
            return;
        }

        const VerticalCore = engine.default;

        const defaults = {
            frequency: 14.2,
            height: 12.5,
            groundType: "medium",
            radialCount: 32,
            radialLength: 5.0
        };

        VerticalCore.render(container, defaults);
    }
};

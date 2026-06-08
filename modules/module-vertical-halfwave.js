/* ============================================================
   HF Antenna Designer — Module: Half‑Wave Vertical
   ============================================================ */

export default {

    name: "Half‑Wave Vertical",

    async init(container) {
        const engine = await import("/engines/vertical-core.js");

        if (!engine || !engine.default) {
            console.error("Half‑Wave engine missing");
            return;
        }

        const VerticalCore = engine.default;

        const defaults = {
            frequency: 14.2,
            height: 10.0,
            groundType: "medium",
            radialCount: 0,
            radialLength: 0
        };

        VerticalCore.render(container, defaults);
    }
};

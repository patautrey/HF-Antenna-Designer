/* ============================================================
   HF Antenna Designer — Module: No‑Radial Vertical
   ============================================================ */

export default {

    name: "No‑Radial Vertical",

    async init(container) {
        const engine = await import("/engines/vertical-core.js");

        if (!engine || !engine.default) {
            console.error("No‑Radial engine missing");
            return;
        }

        const VerticalCore = engine.default;

        const defaults = {
            frequency: 14.2,
            height: 6.0,
            groundType: "poor",
            radialCount: 0,
            radialLength: 0
        };

        VerticalCore.render(container, defaults);
    }
};

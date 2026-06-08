/* ============================================================
   HF Antenna Designer — Module: Base‑Loaded Vertical
   ============================================================ */

export default {

    name: "Base‑Loaded Vertical",

    async init(container) {
        const engine = await import("/engines/vertical-baseloaded.js");

        if (!engine || !engine.default) {
            console.error("Base‑Loaded engine missing");
            return;
        }

        const BaseLoaded = engine.default;

        const defaults = {
            frequency: 14.2,
            height: 3.0,
            loadInductance: 18.0,
            groundType: "medium",
            radialCount: 16,
            radialLength: 5.0
        };

        BaseLoaded.render(container, defaults);
    }
};

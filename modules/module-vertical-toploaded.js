/* ============================================================
   HF Antenna Designer — Module: Top‑Loaded Vertical
   ============================================================ */

export default {

    name: "Top‑Loaded Vertical",

    async init(container) {
        const engine = await import("/engines/vertical-toploaded.js");

        if (!engine || !engine.default) {
            console.error("Top‑Loaded engine missing");
            return;
        }

        const TopLoaded = engine.default;

        const defaults = {
            frequency: 14.2,
            height: 3.5,
            loadInductance: 8.0,
            groundType: "medium",
            radialCount: 16,
            radialLength: 5.0
        };

        TopLoaded.render(container, defaults);
    }
};

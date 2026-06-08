/* ============================================================
   HF Antenna Designer — Module: Center‑Loaded Vertical
   ============================================================ */

export default {

    name: "Center‑Loaded Vertical",

    async init(container) {
        const engine = await import("/engines/vertical-centerloaded.js");

        if (!engine || !engine.default) {
            console.error("Center‑Loaded engine missing");
            return;
        }

        const CenterLoaded = engine.default;

        const defaults = {
            frequency: 14.2,
            height: 4.5,
            loadPosition: 0.5,
            loadInductance: 10.0,
            groundType: "medium",
            radialCount: 16,
            radialLength: 5.0
        };

        CenterLoaded.render(container, defaults);
    }
};

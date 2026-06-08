/* ============================================================
   HF Antenna Designer — Module: Loaded Vertical (General)
   ============================================================ */

export default {

    name: "Loaded Vertical",

    async init(container) {
        const engine = await import("/engines/vertical-loaded.js");

        if (!engine || !engine.default) {
            console.error("Loaded Vertical engine missing");
            return;
        }

        const LoadedVertical = engine.default;

        const defaults = {
            frequency: 14.2,
            height: 4.0,
            loadPosition: 0.5,
            loadInductance: 12.0,
            groundType: "medium",
            radialCount: 16,
            radialLength: 5.0
        };

        LoadedVertical.render(container, defaults);
    }
};

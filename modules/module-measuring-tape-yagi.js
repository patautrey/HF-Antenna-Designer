/* ============================================================
   HF Antenna Designer — Module: Measuring Tape 3‑Element Yagi
   ============================================================ */

export default {

    name: "Measuring Tape 3‑Element Yagi",

    async init(container) {
        const engine = await import("/engines/measuring-tape-yagi.js");

        if (!engine || !engine.default) {
            console.error("Measuring Tape Yagi engine missing");
            return;
        }

        const TapeYagi = engine.default;

        const defaults = {
            frequency: 146.52,          // 2m fox-hunt baseline
            elementMaterial: "steel-tape", // steel-tape, aluminum, copper-tape
            boomLength: 0.9,            // meters
            reflectorLength: 1.03,      // meters
            drivenLength: 0.99,         // meters
            directorLength: 0.95,       // meters
            elementSpacing: {
                reflectorToDriven: 0.30,
                drivenToDirector: 0.25
            },
            feedMethod: "gamma-match",  // gamma-match, direct, hairpin
            foldable: true,             // collapsible measuring-tape elements
            mountingMethod: "handheld", // handheld, mast, tripod
            orientation: 0,
            groundType: "none"
        };

        TapeYagi.render(container, defaults);
    }
};

/* ============================================================
   HF Antenna Designer — Module: Super Doublet
   ============================================================ */

export default {

    name: "Super Doublet",

    async init(container) {
        const engine = await import("/engines/super-doublet.js");

        if (!engine || !engine.default) {
            console.error("Super Doublet engine missing");
            return;
        }

        const SuperDoublet = engine.default;

        const defaults = {
            frequency: 7.1,                 // MHz (40m baseline)
            totalLength: 41.0,              // meters (≈ 135 ft classic)
            feedlineType: "open-wire",      // open-wire, ladder-line
            feedlineLength: 30.0,           // meters
            height: 12.0,                   // meters above ground
            configuration: "horizontal",    // horizontal or inverted-vee
            tunerType: "balanced",          // required for multiband
            orientation: 0,
            groundType: "medium"
        };

        SuperDoublet.render(container, defaults);
    }
};

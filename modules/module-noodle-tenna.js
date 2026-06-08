/* ============================================================
   HF Antenna Designer — Module: Noodle‑Tenna (Enhanced)
   ============================================================ */

export default {

    name: "Noodle‑Tenna",

    async init(container) {
        const engine = await import("/engines/noodle-tenna.js");

        if (!engine || !engine.default) {
            console.error("Noodle‑Tenna engine missing");
            return;
        }

        const NoodleTenna = engine.default;

        const defaults = {
            frequency: 14.2,                 // baseline band
            noodleLength: 1.5,               // meters
            noodleDiameter: 0.07,            // typical pool noodle diameter

            wrapMaterial: "wire",            // wire, copper-tape
            wireGauge: 18,                   // used when wrapMaterial = wire
            tapeWidth: 0.05,                 // used when wrapMaterial = copper-tape

            windingStyle: "helical",         // helical, straight, zigzag
            turns: 12,                       // for helical mode
            windingPitch: 0.02,              // spacing between turns (meters)

            feedMethod: "center-fed",        // center-fed, end-fed
            mountingMethod: "vertical",      // vertical, horizontal, inverted-v
            mountingHeight: 2.0,
            orientation: 0,
            groundType: "medium"
        };

        NoodleTenna.render(container, defaults);
    }
};

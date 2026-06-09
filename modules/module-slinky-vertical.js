/* ============================================================
   HF Antenna Designer — Module: Slinky Vertical
   ============================================================ */

export default {

    name: "Slinky Vertical",

    async init(container) {
        const engine = await import("/engines/slinky-vertical.js");

        if (!engine || !engine.default) {
            console.error("Slinky Vertical engine missing");
            return;
        }

        const SlinkyVertical = engine.default;

        const defaults = {
            frequency: 14.2,                 // baseline band
            slinkyCount: 1,                  // single Slinky as radiator
            slinkyMaterial: "steel",         // steel, copper-plated
            stretchLength: 2.5,              // meters when stretched
            coilDiameter: 0.07,              // typical Slinky diameter
            turnsPerMeter: 40,               // effective turns when stretched

            feedMethod: "base-fed",          // base-fed vertical
            radialCount: 4,
            radialLength: 5.0,

            mountingMethod: "ground-stake",  // ground-stake, tripod, clamp
            mountingHeight: 0.0,
            orientation: 0,
            groundType: "medium"
        };

        SlinkyVertical.render(container, defaults);
    }
};

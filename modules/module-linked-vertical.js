/* ============================================================
   HF Antenna Designer — Module: Linked Vertical Antenna
   ============================================================ */

export default {

    name: "Linked Vertical Antenna",

    async init(container) {
        const engine = await import("/engines/linked-vertical.js");

        if (!engine || !engine.default) {
            console.error("Linked Vertical Antenna engine missing");
            return;
        }

        const LinkedVertical = engine.default;

        const defaults = {
            primaryBand: 20,               // default band in meters
            bandLinks: [
                { band: 40, position: 5.3 },  // link positions in meters from feed
                { band: 30, position: 3.8 },
                { band: 20, position: 2.6 },
                { band: 17, position: 2.1 },
                { band: 15, position: 1.8 }
            ],
            totalLength: 5.3,              // full length for lowest band
            wireGauge: 18,
            feedMethod: "base-fed",        // base-fed vertical
            radialCount: 4,
            radialLength: 5.0,
            mountingMethod: "ground-stake", // ground-stake, tripod, mast
            mountingHeight: 0.0,
            orientation: 0,
            groundType: "medium"
        };

        LinkedVertical.render(container, defaults);
    }
};

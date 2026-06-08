/* ============================================================
   HF Antenna Designer — Module: Linked Dipole Antenna
   ============================================================ */

export default {

    name: "Linked Dipole Antenna",

    async init(container) {
        const engine = await import("/engines/linked-dipole.js");

        if (!engine || !engine.default) {
            console.error("Linked Dipole Antenna engine missing");
            return;
        }

        const LinkedDipole = engine.default;

        const defaults = {
            primaryBand: 20,                 // default band in meters
            bandLinks: [
                { band: 40, left: 10.1, right: 10.1 },
                { band: 30, left: 7.7,  right: 7.7  },
                { band: 20, left: 5.05, right: 5.05 },
                { band: 17, left: 4.0,  right: 4.0  },
                { band: 15, left: 3.35, right: 3.35 }
            ],
            totalLength: 10.1 * 2,           // full length for lowest band
            wireGauge: 18,
            feedMethod: "center-fed",        // center-fed dipole
            feedImpedance: 50,
            mountingMethod: "inverted-v",    // flat-top, inverted-v, sloper
            apexHeight: 8.0,
            endHeight: 2.0,
            orientation: 0,
            groundType: "medium"
        };

        LinkedDipole.render(container, defaults);
    }
};

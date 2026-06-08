/* ============================================================
   HF Antenna Designer — Module: Homebrew Wolf River Coil
   ============================================================ */

export default {

    name: "Homebrew Wolf River Coil",

    async init(container) {
        const engine = await import("/engines/wolf-river-coil.js");

        if (!engine || !engine.default) {
            console.error("Homebrew Wolf River Coil engine missing");
            return;
        }

        const WRC = engine.default;

        const defaults = {
            frequency: 14.2,             // starting band
            whipLength: 2.7,             // telescopic whip (meters)
            coilHeight: 0.25,            // height of the loading coil
            coilDiameter: 0.06,          // 60mm PVC form
            turns: 60,                   // number of turns on the coil
            tapPosition: 22,             // adjustable tap (turn number)
            wireGauge: 14,               // coil wire gauge
            radialCount: 4,
            radialLength: 5.0,
            mountingMethod: "tripod",    // tripod, stake, clamp
            mountingHeight: 0.0,
            orientation: 0,
            groundType: "medium"
        };

        WRC.render(container, defaults);
    }
};

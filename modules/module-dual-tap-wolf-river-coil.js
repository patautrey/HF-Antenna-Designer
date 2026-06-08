/* ============================================================
   HF Antenna Designer — Module: Dual‑Tap Wolf River Coil
   ============================================================ */

export default {

    name: "Dual‑Tap Wolf River Coil",

    async init(container) {
        const engine = await import("/engines/dual-tap-wolf-river-coil.js");

        if (!engine || !engine.default) {
            console.error("Dual‑Tap Wolf River Coil engine missing");
            return;
        }

        const DualWRC = engine.default;

        const defaults = {
            frequency: 14.2,               // starting band
            whipLength: 2.7,               // telescopic whip (meters)
            coilHeight: 0.25,              // coil form height
            coilDiameter: 0.06,            // 60mm PVC
            turns: 60,                     // total turns
            primaryTap: 22,                // main tuning tap
            secondaryTap: 35,              // fine or alternate band tap
            tapMode: "coarse-fine",        // coarse-fine, dual-band, experimental
            wireGauge: 14,                 // coil wire gauge
            radialCount: 4,
            radialLength: 5.0,
            mountingMethod: "tripod",      // tripod, stake, clamp
            mountingHeight: 0.0,
            orientation: 0,
            groundType: "medium"
        };

        DualWRC.render(container, defaults);
    }
};

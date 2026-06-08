/* ============================================================
   HF Antenna Designer — Module: Measuring Tape Vertical Antenna
   ============================================================ */

export default {

    name: "Measuring Tape Vertical Antenna",

    async init(container) {
        const engine = await import("/engines/measuring-tape-vertical.js");

        if (!engine || !engine.default) {
            console.error("Measuring Tape Vertical Antenna engine missing");
            return;
        }

        const TapeVertical = engine.default;

        const defaults = {
            frequency: 14.2,              // 20m baseline
            elementCount: 6,              // number of tape segments used
            segmentLength: 1.0,           // meters per tape segment
            tapeWidth: 0.025,             // 1-inch tape measure metal
            mountingMethod: "PVC-mast",   // PVC, stake, tripod
            feedType: "base-fed",         // base-fed quarter-wave
            radialCount: 4,               // optional radials
            radialLength: 5.0,            // quarter-wave radials
            mountingHeight: 0.0,
            groundType: "medium"
        };

        TapeVertical.render(container, defaults);
    }
};

/* ============================================================
   HF Antenna Designer — Module: Vertical Umbrella Antenna
   ============================================================ */

export default {

    name: "Vertical Umbrella Antenna",

    async init(container) {
        const engine = await import("/engines/vertical-umbrella-antenna.js");

        if (!engine || !engine.default) {
            console.error("Vertical Umbrella Antenna engine missing");
            return;
        }

        const Umbrella = engine.default;

        const defaults = {
            frequency: 14.2,
            mastHeight: 6.0,
            radialCount: 8,
            radialLength: 4.0,
            radialAngle: 45,
            wireGauge: 14,
            mountingHeight: 1.5,
            groundType: "medium"
        };

        Umbrella.render(container, defaults);
    }
};

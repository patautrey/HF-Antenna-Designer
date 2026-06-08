/* ============================================================
   HF Antenna Designer — Module: Vertical Marconi Antenna
   ============================================================ */

export default {

    name: "Vertical Marconi Antenna",

    async init(container) {
        const engine = await import("/engines/vertical-marconi-antenna.js");

        if (!engine || !engine.default) {
            console.error("Vertical Marconi Antenna engine missing");
            return;
        }

        const Marconi = engine.default;

        const defaults = {
            frequency: 14.2,
            radiatorLength: 5.0,
            radialCount: 16,
            radialLength: 5.0,
            wireGauge: 14,
            mountingHeight: 0.0,
            orientation: 0,
            groundType: "medium"
        };

        Marconi.render(container, defaults);
    }
};

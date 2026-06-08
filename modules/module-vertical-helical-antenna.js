/* ============================================================
   HF Antenna Designer — Module: Vertical Helical Antenna
   ============================================================ */

export default {

    name: "Vertical Helical Antenna",

    async init(container) {
        const engine = await import("/engines/vertical-helical-antenna.js");

        if (!engine || !engine.default) {
            console.error("Vertical Helical Antenna engine missing");
            return;
        }

        const Helical = engine.default;

        const defaults = {
            frequency: 14.2,
            coilLength: 2.5,
            coilDiameter: 0.15,
            turns: 45,
            wireGauge: 14,
            mountingHeight: 2.0,
            groundType: "medium"
        };

        Helical.render(container, defaults);
    }
};

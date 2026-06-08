/* ============================================================
   HF Antenna Designer — Module: Inverted‑V Dipole
   ============================================================ */

export default {

    name: "Inverted‑V Dipole",

    async init(container) {
        const engine = await import("/engines/dipole-invertedv.js");

        if (!engine || !engine.default) {
            console.error("Inverted‑V Dipole engine missing");
            return;
        }

        const InvertedV = engine.default;

        const defaults = {
            frequency: 14.2,
            totalLength: 20.0,
            apexHeight: 12.0,
            legAngle: 120,
            wireGauge: 14,
            groundType: "medium"
        };

        InvertedV.render(container, defaults);
    }
};

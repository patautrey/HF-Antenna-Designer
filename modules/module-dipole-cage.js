/* ============================================================
   HF Antenna Designer — Module: Cage Dipole
   ============================================================ */

export default {

    name: "Cage Dipole",

    async init(container) {
        const engine = await import("/engines/dipole-cage.js");

        if (!engine || !engine.default) {
            console.error("Cage Dipole engine missing");
            return;
        }

        const CageDipole = engine.default;

        const defaults = {
            frequency: 14.2,
            totalLength: 20.0,
            wireCount: 6,
            cageDiameter: 0.6,
            height: 10.0,
            wireGauge: 14,
            orientation: 90,
            groundType: "medium"
        };

        CageDipole.render(container, defaults);
    }
};

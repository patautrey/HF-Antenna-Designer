/* ============================================================
   HF Antenna Designer — Module: Vertical Dipole
   ============================================================ */

export default {

    name: "Vertical Dipole",

    async init(container) {
        const engine = await import("/engines/vertical-dipole.js");

        if (!engine || !engine.default) {
            console.error("Vertical Dipole engine missing");
            return;
        }

        const VerticalDipole = engine.default;

        const defaults = {
            frequency: 14.2,
            totalLength: 10.0,
            feedHeight: 2.5,
            wireGauge: 14,
            orientation: 0,
            groundType: "medium"
        };

        VerticalDipole.render(container, defaults);
    }
};

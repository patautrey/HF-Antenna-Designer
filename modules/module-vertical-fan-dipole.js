/* ============================================================
   HF Antenna Designer — Module: Vertical Fan Dipole
   ============================================================ */

export default {

    name: "Vertical Fan Dipole",

    async init(container) {
        const engine = await import("/engines/vertical-fan-dipole.js");

        if (!engine || !engine.default) {
            console.error("Vertical Fan Dipole engine missing");
            return;
        }

        const FanDipole = engine.default;

        const defaults = {
            frequency: 14.2,
            elementCount: 3,
            elementLengths: [10.0, 7.1, 5.3],
            spacing: 0.25,
            feedHeight: 2.5,
            wireGauge: 14,
            orientation: 0,
            groundType: "medium"
        };

        FanDipole.render(container, defaults);
    }
};

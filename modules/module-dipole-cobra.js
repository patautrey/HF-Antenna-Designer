/* ============================================================
   HF Antenna Designer — Module: Cobra Dipole
   ============================================================ */

export default {

    name: "Cobra Dipole",

    async init(container) {
        const engine = await import("/engines/dipole-cobra.js");

        if (!engine || !engine.default) {
            console.error("Cobra Dipole engine missing");
            return;
        }

        const CobraDipole = engine.default;

        const defaults = {
            frequency: 14.2,
            totalLength: 25.0,
            ladderLineLength: 12.0,
            ladderLineSpacing: 0.05,
            height: 10.0,
            wireGauge: 14,
            orientation: 90,
            groundType: "medium"
        };

        CobraDipole.render(container, defaults);
    }
};

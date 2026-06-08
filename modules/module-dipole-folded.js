/* ============================================================
   HF Antenna Designer — Module: Folded Dipole
   ============================================================ */

export default {

    name: "Folded Dipole",

    async init(container) {
        const engine = await import("/engines/dipole-folded.js");

        if (!engine || !engine.default) {
            console.error("Folded Dipole engine missing");
            return;
        }

        const FoldedDipole = engine.default;

        const defaults = {
            frequency: 14.2,
            totalLength: 20.0,
            conductorSpacing: 0.15,
            wireGauge: 14,
            height: 10.0,
            orientation: 90,
            groundType: "medium"
        };

        FoldedDipole.render(container, defaults);
    }
};

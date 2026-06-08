/* ============================================================
   HF Antenna Designer — Module: Vertical Folded Dipole
   ============================================================ */

export default {

    name: "Vertical Folded Dipole",

    async init(container) {
        const engine = await import("/engines/vertical-folded-dipole.js");

        if (!engine || !engine.default) {
            console.error("Vertical Folded Dipole engine missing");
            return;
        }

        const FoldedDipole = engine.default;

        const defaults = {
            frequency: 14.2,
            totalLength: 10.0,
            spacing: 0.15,
            feedHeight: 2.5,
            wireGauge: 14,
            orientation: 0,
            groundType: "medium"
        };

        FoldedDipole.render(container, defaults);
    }
};

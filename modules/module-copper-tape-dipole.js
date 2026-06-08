/* ============================================================
   HF Antenna Designer — Module: Copper Tape Dipole
   ============================================================ */

export default {

    name: "Copper Tape Dipole",

    async init(container) {
        const engine = await import("/engines/copper-tape-dipole.js");

        if (!engine || !engine.default) {
            console.error("Copper Tape Dipole engine missing");
            return;
        }

        const TapeDipole = engine.default;

        const defaults = {
            frequency: 14.2,
            armLength: 5.35,            // each half for 20m
            tapeWidth: 0.05,            // 2-inch copper tape
            substrateMaterial: "drywall", // drywall, plywood, foamboard, plastic
            feedpointType: "center",    // center, off-center
            mountingHeight: 2.5,
            orientation: 0,
            groundType: "medium"
        };

        TapeDipole.render(container, defaults);
    }
};

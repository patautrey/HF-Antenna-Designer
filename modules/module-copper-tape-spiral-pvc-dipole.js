/* ============================================================
   HF Antenna Designer — Module: Copper Tape Spiral‑Wound PVC Dipole
   ============================================================ */

export default {

    name: "Copper Tape Spiral‑Wound PVC Dipole",

    async init(container) {
        const engine = await import("/engines/copper-tape-spiral-pvc-dipole.js");

        if (!engine || !engine.default) {
            console.error("Copper Tape Spiral‑Wound PVC Dipole engine missing");
            return;
        }

        const SpiralPVC = engine.default;

        const defaults = {
            frequency: 14.2,               // baseline band
            pvcDiameter: 0.05,             // 2-inch PVC
            pvcLength: 1.2,                // length of each dipole arm
            tapeWidth: 0.05,               // 2-inch copper tape
            turnsPerArm: 12,               // spiral turns per dipole arm
            windingPitch: 0.02,            // spacing between turns (meters)
            feedMethod: "center-fed",      // center-fed dipole
            mountingMethod: "horizontal",  // horizontal, vertical, sloper
            mountingHeight: 2.5,
            orientation: 0,
            groundType: "medium"
        };

        SpiralPVC.render(container, defaults);
    }
};

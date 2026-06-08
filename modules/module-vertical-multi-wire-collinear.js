/* ============================================================
   HF Antenna Designer — Module: Vertical Multi‑Wire Collinear
   ============================================================ */

export default {

    name: "Vertical Multi‑Wire Collinear",

    async init(container) {
        const engine = await import("/engines/vertical-multi-wire-collinear.js");

        if (!engine || !engine.default) {
            console.error("Vertical Multi‑Wire Collinear engine missing");
            return;
        }

        const Collinear = engine.default;

        const defaults = {
            frequency: 14.2,
            sectionCount: 3,
            sectionLengths: [4.8, 4.8, 4.8],
            phasingCoilValues: [0.0, 0.0],
            feedHeight: 2.5,
            wireGauge: 14,
            orientation: 0,
            groundType: "medium"
        };

        Collinear.render(container, defaults);
    }
};

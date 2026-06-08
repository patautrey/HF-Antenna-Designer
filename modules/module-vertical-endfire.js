/* ============================================================
   HF Antenna Designer — Module: End‑Fire Vertical Array
   ============================================================ */

export default {

    name: "End‑Fire Vertical Array",

    async init(container) {
        const engine = await import("/engines/vertical-endfire.js");

        if (!engine || !engine.default) {
            console.error("End‑Fire Vertical Array engine missing");
            return;
        }

        const EndFire = engine.default;

        const defaults = {
            frequency: 14.2,
            spacing: 0.25,
            phaseShift: 90,
            height: 5.0,
            groundType: "medium",
            radialCount: 16,
            radialLength: 5.0
        };

        EndFire.render(container, defaults);
    }
};

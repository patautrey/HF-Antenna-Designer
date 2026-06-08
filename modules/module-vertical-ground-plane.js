/* ============================================================
   HF Antenna Designer — Module: Vertical Ground‑Plane Antenna
   ============================================================ */

export default {

    name: "Vertical Ground‑Plane Antenna",

    async init(container) {
        const engine = await import("/engines/vertical-ground-plane.js");

        if (!engine || !engine.default) {
            console.error("Vertical Ground‑Plane Antenna engine missing");
            return;
        }

        const GroundPlane = engine.default;

        const defaults = {
            frequency: 14.2,
            radiatorLength: 5.0,
            radialCount: 4,
            radialLength: 5.0,
            radialAngle: 45,
            wireGauge: 14,
            mountingHeight: 2.0,
            orientation: 0,
            groundType: "medium"
        };

        GroundPlane.render(container, defaults);
    }
};

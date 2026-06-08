/* ============================================================
   HF Antenna Designer — Module: Vertical Ground‑Plane
   ============================================================ */

export default {

    name: "Vertical Ground‑Plane",

    async init(container) {
        const engine = await import("/engines/vertical-ground-plane.js");

        if (!engine || !engine.default) {
            console.error("Vertical Ground‑Plane engine missing");
            return;
        }

        const GroundPlane = engine.default;

        const defaults = {
            frequency: 14.2,
            radiatorLength: 5.0,
            radialCount: 4,
            radialLength: 5.0,
            radialAngle: 45,
            feedHeight: 2.0,
            wireGauge: 14,
            groundType: "medium"
        };

        GroundPlane.render(container, defaults);
    }
};

/* ============================================================
   HF Antenna Designer — Module: Ground Plane Antenna
   ============================================================ */

export default {

    name: "Ground Plane Antenna",

    async init(container) {
        const engine = await import("/engines/ground-plane.js");

        if (!engine || !engine.default) {
            console.error("Ground Plane Antenna engine missing");
            return;
        }

        const GroundPlane = engine.default;

        const defaults = {
            frequency: 28.4,                // MHz (10m baseline)
            radiatorLength: 2.5,            // meters (¼-wave typical)
            radialCount: 4,                 // number of radials
            radialLength: 2.5,              // meters
            radialAngle: 45,                // degrees downward
            feedImpedance: 50,              // ohms
            mountingMethod: "mast-top",
            mountingHeight: 6.0,
            orientation: 0,
            groundType: "none",

            // Ground-plane-specific modeling
            includeRadialAngleEffect: true,
            includeMutualCoupling: true,
            calculateFeedpointImpedance: true,
            calculatePattern: true,
            calculateSWR: true
        };

        GroundPlane.render(container, defaults);
    }
};

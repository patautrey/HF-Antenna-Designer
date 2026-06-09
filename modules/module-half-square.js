/* ============================================================
   HF Antenna Designer — Module: Half-Square Antenna
   ============================================================ */

export default {

    name: "Half-Square Antenna",

    async init(container) {
        const engine = await import("/engines/half-square.js");

        if (!engine || !engine.default) {
            console.error("Half-Square Antenna engine missing");
            return;
        }

        const HalfSquare = engine.default;

        const defaults = {
            frequency: 7.1,                 // MHz (40m baseline)
            verticalLegLength: 10.0,        // meters (¼-wave typical)
            horizontalTopLength: 20.0,      // meters (½-wave typical)
            wireDiameter: 0.003,            // 12 AWG
            feedpointLocation: "corner",    // corner or center
            mountingHeight: 10.0,           // meters
            orientation: 0,
            groundType: "medium",

            // Half-square-specific modeling
            includeMutualCoupling: true,
            includeEndEffects: true,
            calculatePattern: true,
            calculateTakeoffAngle: true,
            calculateImpedance: true
        };

        HalfSquare.render(container, defaults);
    }
};

/* ============================================================
   HF Antenna Designer — Module: Hex Beam
   ============================================================ */

export default {

    name: "Hex Beam",

    async init(container) {
        const engine = await import("/engines/hex-beam.js");

        if (!engine || !engine.default) {
            console.error("Hex Beam engine missing");
            return;
        }

        const HexBeam = engine.default;

        const defaults = {
            frequency: 14.2,                // MHz (20m baseline)
            spreaderLength: 2.7,            // meters
            wirePerimeter: 11.0,            // meters (approx. driven element)
            reflectorPerimeter: 12.0,       // meters
            wireDiameter: 0.002,            // 14 AWG
            feedImpedance: 50,
            mountingHeight: 10.0,
            orientation: 0,
            groundType: "medium",

            // Hex-beam-specific modeling
            includeMutualCoupling: true,
            includeReflectorSpacing: true,
            calculateGain: true,
            calculateFrontToBack: true,
            calculatePattern: true
        };

        HexBeam.render(container, defaults);
    }
};

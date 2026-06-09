/* ============================================================
   HF Antenna Designer — Module: Magnetic Loop (John Portune)
   ============================================================ */

export default {

    name: "Magnetic Loop Antenna",

    async init(container) {
        const engine = await import("/engines/magnetic-loop.js");

        if (!engine || !engine.default) {
            console.error("Magnetic Loop Antenna engine missing");
            return;
        }

        const MagLoop = engine.default;

        const defaults = {
            frequency: 14.2,                // MHz (20m band)
            loopDiameter: 1.0,              // meters (Portune recommends 1m)
            conductorDiameter: 0.025,       // 1-inch copper tubing
            capacitorMin: 10e-12,           // 10 pF
            capacitorMax: 500e-12,          // 500 pF
            capacitorQ: 2000,               // High-Q vacuum/butterfly capacitor
            couplingMethod: "coupling-loop",
            couplingLoopDiameter: 0.25,     // 25% of main loop diameter
            mountingMethod: "vertical",
            mountingHeight: 1.5,
            orientation: 0,
            groundType: "medium",

            // Portune-specific modeling parameters
            includeSkinEffect: true,
            includeLossResistance: true,
            includeRadiationResistance: true,
            calculateEfficiency: true,
            calculateQFactor: true,
            calculateBandwidth: true,
            calculateCapacitorVoltage: true
        };

        MagLoop.render(container, defaults);
    }
};

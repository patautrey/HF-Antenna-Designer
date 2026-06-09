/* ============================================================
   HF Antenna Designer — Module: EH Magnetic Antenna
   ============================================================ */

export default {

    name: "EH Magnetic Antenna",

    async init(container) {
        const engine = await import("/engines/eh-magnetic.js");

        if (!engine || !engine.default) {
            console.error("EH Magnetic Antenna engine missing");
            return;
        }

        const EH = engine.default;

        const defaults = {
            frequency: 7.1,                 // MHz (40m typical)
            cylinderLength: 0.25,           // meters
            cylinderDiameter: 0.10,         // meters
            spacingBetweenCylinders: 0.05,  // meters
            tuningCapacitance: 50e-12,      // 50 pF
            conductorMaterial: "copper",
            mountingMethod: "vertical",
            mountingHeight: 3.0,
            orientation: 0,
            groundType: "medium",

            // EH-specific modeling
            includeDisplacementCurrent: true,
            includeEFieldHFieldPhasing: true,
            calculateRadiationResistance: true,
            calculateEfficiency: true
        };

        EH.render(container, defaults);
    }
};

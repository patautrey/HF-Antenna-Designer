/* ============================================================
   HF Antenna Designer — Module: Half-Wave Dipole
   ============================================================ */

export default {

    name: "Half-Wave Dipole",

    async init(container) {
        const engine = await import("/engines/half-wave-dipole.js");

        if (!engine || !engine.default) {
            console.error("Half-Wave Dipole engine missing");
            return;
        }

        const Dipole = engine.default;

        const defaults = {
            frequency: 14.2,                // MHz (20m baseline)
            totalLength: 10.1,              // meters (≈ ½-wave)
            wireDiameter: 0.002,            // 14 AWG
            feedImpedance: 50,              // ohms
            configuration: "horizontal",    // horizontal, inverted-V, sloper
            apexHeight: 10.0,               // meters
            legAngle: 180,                  // degrees (180 = straight dipole)
            orientation: 0,
            groundType: "medium",

            // Dipole-specific modeling
            includeEndEffects: true,
            includeHeightEffects: true,
            calculatePattern: true,
            calculateImpedance: true,
            calculateSWR: true
        };

        Dipole.render(container, defaults);
    }
};

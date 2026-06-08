/* ============================================================
   HF Antenna Designer — Module: Slinky Dipole
   ============================================================ */

export default {

    name: "Slinky Dipole",

    async init(container) {
        const engine = await import("/engines/slinky-dipole.js");

        if (!engine || !engine.default) {
            console.error("Slinky Dipole engine missing");
            return;
        }

        const SlinkyDipole = engine.default;

        const defaults = {
            frequency: 14.2,                 // baseline band
            slinkyCount: 2,                  // one per dipole arm
            slinkyMaterial: "steel",         // steel, copper-plated
            stretchLengthPerArm: 2.5,        // meters per arm when stretched
            coilDiameter: 0.07,              // typical Slinky diameter
            turnsPerMeter: 40,               // effective turns when stretched
            feedMethod: "center-fed",        // center-fed dipole
            mountingMethod: "inverted-v",    // inverted-v, flat-top, sloper
            apexHeight: 6.0,
            endHeight: 1.5,
            orientation: 0,
            groundType: "medium"
        };

        SlinkyDipole.render(container, defaults);
    }
};

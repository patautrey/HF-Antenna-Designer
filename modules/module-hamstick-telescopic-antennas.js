/* ============================================================
   HF Antenna Designer — Module: Hamstick & Telescopic Antennas
   ============================================================ */

export default {

    name: "Hamstick & Telescopic Antennas",

    async init(container) {
        const engine = await import("/engines/hamstick-telescopic-antennas.js");

        if (!engine || !engine.default) {
            console.error("Hamstick & Telescopic Antennas engine missing");
            return;
        }

        const HamstickTelescopic = engine.default;

        const defaults = {
            mode: "hamstick",             // hamstick, telescopic, dipole-pair
            frequency: 14.2,              // baseline band
            whipLength: 2.4,              // telescopic whip length (meters)
            hamstickLength: 2.1,          // typical hamstick length
            loadingCoilPosition: 0.6,     // meters from feedpoint
            loadingCoilQ: 180,            // coil quality factor
            mountType: "3/8-24",          // standard hamstick mount
            configuration: "vertical",    // vertical, dipole, mobile
            radialCount: 4,               // for vertical mode
            radialLength: 5.0,
            dipoleSpacing: 0.0,           // used only in dipole-pair mode
            mountingHeight: 2.0,
            orientation: 0,
            groundType: "medium"
        };

        HamstickTelescopic.render(container, defaults);
    }
};

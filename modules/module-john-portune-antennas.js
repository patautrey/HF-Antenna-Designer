/* ============================================================
   HF Antenna Designer — Module: John Portune Antennas
   ============================================================ */

export default {

    name: "John Portune Antennas",

    async init(container) {
        const engine = await import("/engines/john-portune-antennas.js");

        if (!engine || !engine.default) {
            console.error("John Portune Antennas engine missing");
            return;
        }

        const Portune = engine.default;

        const defaults = {
            design: "slot-antenna",        // slot-antenna, coaxial-slot, stealth-wall, attic-loop
            frequency: 14.2,
            slotLength: 10.0,              // for slot antennas
            slotWidth: 0.05,
            coaxLength: 6.0,               // for coaxial-slot designs
            wallMaterial: "drywall",       // drywall, stucco, plywood
            mountingMethod: "indoor-wall", // indoor-wall, attic, balcony
            feedMethod: "coax-center",     // coax-center, gamma, transformer
            orientation: 0,
            mountingHeight: 2.5,
            groundType: "medium"
        };

        Portune.render(container, defaults);
    }
};

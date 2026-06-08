/* ============================================================
   HF Antenna Designer — Module: Copper Tape Slot Antenna
   ============================================================ */

export default {

    name: "Copper Tape Slot Antenna",

    async init(container) {
        const engine = await import("/engines/copper-tape-slot-antenna.js");

        if (!engine || !engine.default) {
            console.error("Copper Tape Slot Antenna engine missing");
            return;
        }

        const Slot = engine.default;

        const defaults = {
            frequency: 14.2,
            slotLength: 10.0,
            slotWidth: 0.05,
            tapeWidth: 0.05,
            substrateMaterial: "drywall",   // drywall, plywood, foamboard, plastic
            feedpointOffset: 0.15,          // fraction of slot length from one end
            mountingHeight: 2.5,
            orientation: 0,
            groundType: "medium"
        };

        Slot.render(container, defaults);
    }
};

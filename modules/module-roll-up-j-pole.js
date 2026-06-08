/* ============================================================
   HF Antenna Designer — Module: Roll‑Up J‑Pole Antenna
   ============================================================ */

export default {

    name: "Roll‑Up J‑Pole Antenna",

    async init(container) {
        const engine = await import("/engines/roll-up-j-pole.js");

        if (!engine || !engine.default) {
            console.error("Roll‑Up J‑Pole Antenna engine missing");
            return;
        }

        const Jpole = engine.default;

        const defaults = {
            frequency: 146.52,          // 2m calling frequency baseline
            radiatorLength: 1.52,       // driven element length (meters)
            matchingStubLength: 0.48,   // J‑stub section
            feedpointOffset: 0.05,      // distance from bottom of stub
            material: "300-ohm-twinlead", // twinlead, ladderline, copper-tape
            rollUpWidth: 0.03,          // width of the flexible radiator
            mountingMethod: "suspension", // suspension, mast, window
            orientation: 0,
            groundType: "none"          // J‑pole is ground‑independent
        };

        Jpole.render(container, defaults);
    }
};

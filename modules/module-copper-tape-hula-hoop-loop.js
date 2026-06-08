/* ============================================================
   HF Antenna Designer — Module: Copper Tape Hula‑Hoop Magnetic Loop
   ============================================================ */

export default {

    name: "Copper Tape Hula‑Hoop Magnetic Loop",

    async init(container) {
        const engine = await import("/engines/copper-tape-hula-hoop-loop.js");

        if (!engine || !engine.default) {
            console.error("Copper Tape Hula‑Hoop Magnetic Loop engine missing");
            return;
        }

        const HoopLoop = engine.default;

        const defaults = {
            frequency: 14.2,               // baseline band
            hoopDiameter: 0.9,             // 36-inch hula hoop
            tapeWidth: 0.05,               // 2-inch copper tape
            loopCircumference: 2.83,       // auto-calculated from diameter
            capacitorType: "variable",     // variable, butterfly, trombone
            capacitorRange: "10-250pF",    // tuning range
            couplingMethod: "gamma",       // gamma, Faraday loop, transformer
            couplingLoopDiameter: 0.18,    // 20% of main loop
            mountingMethod: "tripod",      // tripod, table, ground
            orientation: 0,
            groundType: "none"
        };

        HoopLoop.render(container, defaults);
    }
};

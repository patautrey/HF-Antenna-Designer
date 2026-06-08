/* ============================================================
   HF Antenna Designer — Module: Slinky Vertical
   ============================================================ */

export default {

    name: "Slinky Vertical",

    async init(container) {
        const engine = await import("/engines/vertical-slinky.js");

        if (!engine || !engine.default) {
            console.error("Slinky Vertical engine missing");
            return;
        }

        const SlinkyVertical = engine.default;

        const defaults = {
            frequency: 14.2,
            height: 2.5,
            coilTurns: 85,
            wireDiameter: 0.003,
            stretchFactor: 0.65,
            groundType: "poor",
            radialCount: 8,
            radialLength: 3.0
        };

        SlinkyVertical.render(container, defaults);
    }
};

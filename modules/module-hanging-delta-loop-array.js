/* ============================================================
   HF Antenna Designer — Module: Hanging Delta Loop Array
   ============================================================ */

export default {

    name: "Hanging Delta Loop Array",

    async init(container) {
        const engine = await import("/engines/hanging-delta-loop-array.js");

        if (!engine || !engine.default) {
            console.error("Hanging Delta Loop Array engine missing");
            return;
        }

        const DeltaArray = engine.default;

        const defaults = {
            frequency: 14.2,
            loopPerimeter: 21.4,
            apexHeight: 12.0,
            baseWidth: 7.0,
            parasiticCount: 3,
            parasiticTypes: ["reflector", "director", "director"],
            parasiticSpacing: [2.5, 2.5, 2.5],
            wireGauge: 12,
            messengerLineHeight: 13.0,
            orientation: 0,
            groundType: "medium"
        };

        DeltaArray.render(container, defaults);
    }
};

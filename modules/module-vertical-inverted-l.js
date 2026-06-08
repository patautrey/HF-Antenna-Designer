/* ============================================================
   HF Antenna Designer — Module: Vertical Inverted‑L
   ============================================================ */

export default {

    name: "Vertical Inverted‑L",

    async init(container) {
        const engine = await import("/engines/vertical-inverted-l.js");

        if (!engine || !engine.default) {
            console.error("Vertical Inverted‑L engine missing");
            return;
        }

        const InvertedL = engine.default;

        const defaults = {
            frequency: 14.2,
            verticalLength: 6.0,
            horizontalLength: 8.0,
            feedHeight: 2.0,
            wireGauge: 14,
            orientation: 90,
            groundType: "medium"
        };

        InvertedL.render(container, defaults);
    }
};

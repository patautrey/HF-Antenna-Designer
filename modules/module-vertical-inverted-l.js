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
            verticalSection: 6.0,
            horizontalSection: 8.0,
            wireGauge: 14,
            mountingHeight: 2.0,
            orientation: 0,
            groundType: "medium"
        };

        InvertedL.render(container, defaults);
    }
};

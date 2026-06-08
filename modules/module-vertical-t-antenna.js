/* ============================================================
   HF Antenna Designer — Module: Vertical T‑Antenna
   ============================================================ */

export default {

    name: "Vertical T‑Antenna",

    async init(container) {
        const engine = await import("/engines/vertical-t-antenna.js");

        if (!engine || !engine.default) {
            console.error("Vertical T‑Antenna engine missing");
            return;
        }

        const TAntenna = engine.default;

        const defaults = {
            frequency: 14.2,
            verticalLength: 8.0,
            topHatWidth: 6.0,
            topHatWires: 2,
            feedHeight: 2.0,
            wireGauge: 14,
            groundType: "medium"
        };

        TAntenna.render(container, defaults);
    }
};

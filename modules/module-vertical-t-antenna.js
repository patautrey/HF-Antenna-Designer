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
            verticalSection: 6.0,
            topHatLength: 10.0,
            topHatHeight: 8.0,
            wireGauge: 14,
            mountingHeight: 2.0,
            orientation: 0,
            groundType: "medium"
        };

        TAntenna.render(container, defaults);
    }
};

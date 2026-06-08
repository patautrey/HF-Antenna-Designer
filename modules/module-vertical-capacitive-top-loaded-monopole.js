/* ============================================================
   HF Antenna Designer — Module: Vertical Capacitive Top‑Loaded Monopole
   ============================================================ */

export default {

    name: "Vertical Capacitive Top‑Loaded Monopole",

    async init(container) {
        const engine = await import("/engines/vertical-capacitive-top-loaded-monopole.js");

        if (!engine || !engine.default) {
            console.error("Vertical Capacitive Top‑Loaded Monopole engine missing");
            return;
        }

        const CapTop = engine.default;

        const defaults = {
            frequency: 14.2,
            radiatorLength: 1.8,
            topHatRadius: 0.6,
            topHatSpokes: 6,
            wireGauge: 14,
            mountingHeight: 2.0,
            groundType: "medium"
        };

        CapTop.render(container, defaults);
    }
};

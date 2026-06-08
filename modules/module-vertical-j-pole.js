/* ============================================================
   HF Antenna Designer — Module: Vertical J‑Pole
   ============================================================ */

export default {

    name: "Vertical J‑Pole",

    async init(container) {
        const engine = await import("/engines/vertical-j-pole.js");

        if (!engine || !engine.default) {
            console.error("Vertical J‑Pole engine missing");
            return;
        }

        const JPole = engine.default;

        const defaults = {
            frequency: 14.2,
            radiatorLength: 4.9,
            matchingSectionLength: 1.6,
            feedPointOffset: 0.15,
            wireGauge: 14,
            mountingHeight: 3.0,
            groundType: "medium"
        };

        JPole.render(container, defaults);
    }
};

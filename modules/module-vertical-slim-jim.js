/* ============================================================
   HF Antenna Designer — Module: Vertical Slim‑Jim
   ============================================================ */

export default {

    name: "Vertical Slim‑Jim",

    async init(container) {
        const engine = await import("/engines/vertical-slim-jim.js");

        if (!engine || !engine.default) {
            console.error("Vertical Slim‑Jim engine missing");
            return;
        }

        const SlimJim = engine.default;

        const defaults = {
            frequency: 14.2,
            totalLength: 9.8,
            matchingSectionLength: 3.2,
            feedPointOffset: 0.25,
            wireGauge: 14,
            mountingHeight: 3.0,
            groundType: "medium"
        };

        SlimJim.render(container, defaults);
    }
};

/* ============================================================
   HF Antenna Designer — Module: 2‑Element Vertical Yagi
   ============================================================ */

export default {

    name: "2‑Element Vertical Yagi",

    async init(container) {
        const engine = await import("/engines/vertical-yagi2.js");

        if (!engine || !engine.default) {
            console.error("2‑Element Vertical Yagi engine missing");
            return;
        }

        const Yagi2 = engine.default;

        const defaults = {
            frequency: 14.2,
            spacing: 0.15,
            reflectorFactor: 1.05,
            directorFactor: 0.95,
            height: 5.0,
            groundType: "medium"
        };

        Yagi2.render(container, defaults);
    }
};

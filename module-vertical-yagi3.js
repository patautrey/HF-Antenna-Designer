/* ============================================================
   HF Antenna Designer — Module: 3‑Element Vertical Yagi
   ============================================================ */

export default {

    name: "3‑Element Vertical Yagi",

    async init(container) {
        const engine = await import("/engines/vertical-yagi3.js");

        if (!engine || !engine.default) {
            console.error("3‑Element Vertical Yagi engine missing");
            return;
        }

        const Yagi3 = engine.default;

        const defaults = {
            frequency: 14.2,
            spacingReflector: 0.18,
            spacingDirector: 0.12,
            reflectorFactor: 1.05,
            directorFactor: 0.95,
            height: 5.0,
            groundType: "medium"
        };

        Yagi3.render(container, defaults);
    }
};

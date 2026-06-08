/* ============================================================
   HF Antenna Designer — Module: Vertical End‑Fed Half‑Wave
   ============================================================ */

export default {

    name: "Vertical End‑Fed Half‑Wave",

    async init(container) {
        const engine = await import("/engines/vertical-end-fed-half-wave.js");

        if (!engine || !engine.default) {
            console.error("Vertical End‑Fed Half‑Wave engine missing");
            return;
        }

        const EFHW = engine.default;

        const defaults = {
            frequency: 14.2,
            totalLength: 10.1,
            transformerImpedance: 49,
            feedHeight: 2.0,
            wireGauge: 14,
            orientation: 0,
            groundType: "medium"
        };

        EFHW.render(container, defaults);
    }
};

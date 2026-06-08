/* ============================================================
   HF Antenna Designer — Module: Vertical Short‑Loaded Monopole
   ============================================================ */

export default {

    name: "Vertical Short‑Loaded Monopole",

    async init(container) {
        const engine = await import("/engines/vertical-short-loaded-monopole.js");

        if (!engine || !engine.default) {
            console.error("Vertical Short‑Loaded Monopole engine missing");
            return;
        }

        const ShortLoaded = engine.default;

        const defaults = {
            frequency: 14.2,
            radiatorLength: 1.6,
            loadingCoilInductance: 28.0,
            loadingCoilPosition: 0.9,
            wireGauge: 14,
            mountingHeight: 2.0,
            groundType: "medium"
        };

        ShortLoaded.render(container, defaults);
    }
};

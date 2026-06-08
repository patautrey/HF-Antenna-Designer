/* ============================================================
   HF Antenna Designer — Module: Vertical Moxon
   ============================================================ */

export default {

    name: "Vertical Moxon",

    async init(container) {
        const engine = await import("/engines/vertical-moxon.js");

        if (!engine || !engine.default) {
            console.error("Vertical Moxon engine missing");
            return;
        }

        const Moxon = engine.default;

        const defaults = {
            frequency: 14.2,
            height: 5.0,
            spacing: 0.12,
            foldback: 0.08,
            groundType: "medium"
        };

        Moxon.render(container, defaults);
    }
};

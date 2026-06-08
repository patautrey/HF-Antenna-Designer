/* ============================================================
   HF Antenna Designer — Module: Vertical Loaded Whip
   ============================================================ */

export default {

    name: "Vertical Loaded Whip",

    async init(container) {
        const engine = await import("/engines/vertical-loaded-whip.js");

        if (!engine || !engine.default) {
            console.error("Vertical Loaded Whip engine missing");
            return;
        }

        const LoadedWhip = engine.default;

        const defaults = {
            frequency: 14.2,
            whipLength: 2.0,
            loadingCoilPosition: 1.2,
            loadingCoilInductance: 18.0,
            wireGauge: 14,
            mountingHeight: 2.0,
            groundType: "medium"
        };

        LoadedWhip.render(container, defaults);
    }
};

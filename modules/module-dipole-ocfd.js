/* ============================================================
   HF Antenna Designer — Module: Off‑Center‑Fed Dipole (OCFD)
   ============================================================ */

export default {

    name: "Off‑Center‑Fed Dipole",

    async init(container) {
        const engine = await import("/engines/dipole-ocfd.js");

        if (!engine || !engine.default) {
            console.error("OCFD engine missing");
            return;
        }

        const OCFD = engine.default;

        const defaults = {
            frequency: 14.2,
            totalLength: 41.0,
            feedOffset: 0.33,
            height: 10.0,
            wireGauge: 14,
            orientation: 90,
            balunImpedance: 200,
            groundType: "medium"
        };

        OCFD.render(container, defaults);
    }
};

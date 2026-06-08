/* ============================================================
   HF Antenna Designer — Module: Basic Dipole
   ============================================================ */

export default {

    name: "Basic Dipole",

    async init(container) {
        const engine = await import("/engines/dipole-basic.js");

        if (!engine || !engine.default) {
            console.error("Basic Dipole engine missing");
            return;
        }

        const DipoleBasic = engine.default;

        const defaults = {
            frequency: 14.2,
            totalLength: 20.0,
            height: 10.0,
            wireGauge: 14,
            orientation: 90,
            groundType: "medium"
        };

        DipoleBasic.render(container, defaults);
    }
};

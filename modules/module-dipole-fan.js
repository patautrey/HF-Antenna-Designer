/* ============================================================
   HF Antenna Designer — Module: Fan Dipole
   ============================================================ */

export default {

    name: "Fan Dipole",

    async init(container) {
        const engine = await import("/engines/dipole-fan.js");

        if (!engine || !engine.default) {
            console.error("Fan Dipole engine missing");
            return;
        }

        const FanDipole = engine.default;

        const defaults = {
            frequency: 14.2,
            bands: [
                { freq: 7.1, length: 40.0 },
                { freq: 14.2, length: 20.0 },
                { freq: 21.2, length: 14.0 }
            ],
            height: 10.0,
            wireGauge: 14,
            orientation: 90,
            groundType: "medium"
        };

        FanDipole.render(container, defaults);
    }
};

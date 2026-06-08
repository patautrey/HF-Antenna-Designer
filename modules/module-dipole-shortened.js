/* ============================================================
   HF Antenna Designer — Module: Shortened Dipole
   ============================================================ */

export default {

    name: "Shortened Dipole",

    async init(container) {
        const engine = await import("/engines/dipole-shortened.js");

        if (!engine || !engine.default) {
            console.error("Shortened Dipole engine missing");
            return;
        }

        const ShortenedDipole = engine.default;

        const defaults = {
            frequency: 14.2,
            totalLength: 12.0,
            loadingCoilInductance: 8.5,
            coilPosition: 0.66,
            height: 10.0,
            wireGauge: 14,
            orientation: 90,
            groundType: "medium"
        };

        ShortenedDipole.render(container, defaults);
    }
};

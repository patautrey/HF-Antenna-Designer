/* ============================================================
   HF Antenna Designer — Module: Trap Dipole
   ============================================================ */

export default {

    name: "Trap Dipole",

    async init(container) {
        const engine = await import("/engines/dipole-trap.js");

        if (!engine || !engine.default) {
            console.error("Trap Dipole engine missing");
            return;
        }

        const TrapDipole = engine.default;

        const defaults = {
            frequency: 14.2,
            traps: [
                { freq: 21.2, inductance: 2.5, capacitance: 22 },
                { freq: 28.4, inductance: 1.1, capacitance: 15 }
            ],
            totalLength: 20.0,
            height: 10.0,
            wireGauge: 14,
            orientation: 90,
            groundType: "medium"
        };

        TrapDipole.render(container, defaults);
    }
};

/* ============================================================
   HF Antenna Designer — Module: Terminated Dipole (T2FD)
   ============================================================ */

export default {

    name: "Terminated Dipole (T2FD)",

    async init(container) {
        const engine = await import("/engines/dipole-terminated.js");

        if (!engine || !engine.default) {
            console.error("Terminated Dipole engine missing");
            return;
        }

        const TerminatedDipole = engine.default;

        const defaults = {
            frequency: 14.2,
            totalLength: 27.0,
            resistorValue: 390,
            tiltAngle: 20,
            height: 10.0,
            wireGauge: 14,
            orientation: 90,
            groundType: "medium"
        };

        TerminatedDipole.render(container, defaults);
    }
};

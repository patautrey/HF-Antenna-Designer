/* ============================================================
   HF Antenna Designer — Module: Vertical T2FD
   ============================================================ */

export default {

    name: "Vertical T2FD",

    async init(container) {
        const engine = await import("/engines/vertical-t2fd.js");

        if (!engine || !engine.default) {
            console.error("Vertical T2FD engine missing");
            return;
        }

        const T2FD = engine.default;

        const defaults = {
            frequency: 14.2,
            totalLength: 12.0,
            tiltAngle: 90,
            resistorValue: 390,
            feedHeight: 2.0,
            wireGauge: 14,
            groundType: "medium"
        };

        T2FD.render(container, defaults);
    }
};

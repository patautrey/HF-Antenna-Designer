/* ============================================================
   HF Antenna Designer — Module: Broadside Vertical Array
   ============================================================ */

export default {

    name: "Broadside Vertical Array",

    async init(container) {
        const engine = await import("/engines/vertical-broadside.js");

        if (!engine || !engine.default) {
            console.error("Broadside Vertical Array engine missing");
            return;
        }

        const Broadside = engine.default;

        const defaults = {
            frequency: 14.2,
            spacing: 0.25,
            phaseShift: 0,
            height: 5.0,
            groundType: "medium",
            radialCount: 16,
            radialLength: 5.0
        };

        Broadside.render(container, defaults);
    }
};

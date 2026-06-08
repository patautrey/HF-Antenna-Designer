/* ============================================================
   HF Antenna Designer — Module: Vertical Coaxial Collinear
   ============================================================ */

export default {

    name: "Vertical Coaxial Collinear",

    async init(container) {
        const engine = await import("/engines/vertical-coaxial-collinear.js");

        if (!engine || !engine.default) {
            console.error("Vertical Coaxial Collinear engine missing");
            return;
        }

        const CoaxCollinear = engine.default;

        const defaults = {
            frequency: 14.2,
            sectionCount: 4,
            sectionLengths: [3.4, 3.4, 3.4, 3.4],
            phasingSleeveLengths: [0.25, 0.25, 0.25],
            feedHeight: 2.5,
            coaxType: "RG-58",
            orientation: 0,
            groundType: "medium"
        };

        CoaxCollinear.render(container, defaults);
    }
};

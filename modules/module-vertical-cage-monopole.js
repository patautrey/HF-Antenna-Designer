/* ============================================================
   HF Antenna Designer — Module: Vertical Cage Monopole
   ============================================================ */

export default {

    name: "Vertical Cage Monopole",

    async init(container) {
        const engine = await import("/engines/vertical-cage-monopole.js");

        if (!engine || !engine.default) {
            console.error("Vertical Cage Monopole engine missing");
            return;
        }

        const CageMonopole = engine.default;

        const defaults = {
            frequency: 14.2,
            cageHeight: 10.0,
            cageDiameter: 1.2,
            wireCount: 6,
            feedHeight: 1.5,
            wireGauge: 14,
            groundType: "medium"
        };

        CageMonopole.render(container, defaults);
    }
};

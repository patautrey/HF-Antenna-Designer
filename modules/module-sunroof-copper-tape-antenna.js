/* ============================================================
   HF Antenna Designer — Module: SunRoof Copper Tape Antenna
   ============================================================ */

export default {

    name: "SunRoof Copper Tape Antenna",

    async init(container) {
        const engine = await import("/engines/sunroof-copper-tape-antenna.js");

        if (!engine || !engine.default) {
            console.error("SunRoof Copper Tape Antenna engine missing");
            return;
        }

        const SunRoof = engine.default;

        const defaults = {
            frequency: 14.2,
            tapeLength: 10.0,
            tapeWidth: 0.05,
            layoutStyle: "perimeter",   // perimeter, zigzag, folded, dipole‑style
            roofMaterial: "asphalt",    // asphalt, tile, metal, composite
            feedpointLocation: "corner", // corner, center, edge
            wireGaugeEquivalent: 18,
            mountingHeight: 2.5,
            groundType: "medium"
        };

        SunRoof.render(container, defaults);
    }
};

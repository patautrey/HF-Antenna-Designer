/* ============================================================
   HF Antenna Designer — Module: Rain Gutter Antenna
   ============================================================ */

export default {

    name: "Rain Gutter Antenna",

    async init(container) {
        const engine = await import("/engines/rain-gutter-antenna.js");

        if (!engine || !engine.default) {
            console.error("Rain Gutter Antenna engine missing");
            return;
        }

        const Gutter = engine.default;

        const defaults = {
            frequency: 14.2,
            gutterLength: 12.0,          // total conductive length available
            gutterMaterial: "aluminum",  // aluminum, galvanized, copper
            downspoutIncluded: true,     // include vertical section
            feedMethod: "unun-9to1",     // 9:1 unun, 4:1, direct
            mountingHeight: 2.5,
            bondingJoints: true,         // whether joints are electrically bonded
            groundConnection: "house",   // house ground, isolated, counterpoise
            groundType: "poor"
        };

        Gutter.render(container, defaults);
    }
};

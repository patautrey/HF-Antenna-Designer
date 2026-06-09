/* ============================================================
   HF Antenna Designer — Boost Engine
   ============================================================ */

export default {

    applyBoosts(config, geometry) {

        if (config.boostHighEfficiency) {
            geometry.segments.forEach(seg => seg.resistance *= 0.5);
        }

        if (config.boostRealGround) {
            geometry.groundLossFactor = 1.0;
        }

        if (config.boostHighResolution) {
            geometry.segments = refineSegments(geometry.segments);
        }

        return geometry;
    }
};

function refineSegments(segments) {
    const refined = [];
    segments.forEach(seg => {
        const mid = {
            x: (seg.x1 + seg.x2) / 2,
            y: (seg.y1 + seg.y2) / 2,
            z: (seg.z1 + seg.z2) / 2
        };
        refined.push({ x1: seg.x1, y1: seg.y1, z1: seg.z1, x2: mid.x, y2: mid.y, z2: mid.z });
        refined.push({ x1: mid.x, y1: mid.y, z1: mid.z, x2: seg.x2, y2: seg.y2, z2: seg.z2 });
    });
    return refined;
}

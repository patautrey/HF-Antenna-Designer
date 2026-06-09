/* ============================================================
   HF Antenna Designer — Tilted Vertical Engine
   NEC-Style Geometry + Adaptive Segmentation
   ============================================================ */

import BaseEngine from "/engines/engine-base.js";
import BoostEngine from "/engines/boost-engine.js";

export default class TiltedVerticalEngine extends BaseEngine {

    constructor(config) {
        super(config);
    }

    buildGeometry() {
        const {
            frequency,
            wireDiameter,
            height,
            tiltAngleDeg,
            segments = 60,
            feedImpedance,
            groundType
        } = this.config;

        const tilt = (tiltAngleDeg * Math.PI) / 180;
        const segList = [];

        for (let i = 0; i < segments; i++) {
            const f1 = i / segments;
            const f2 = (i + 1) / segments;

            const x1 = Math.sin(tilt) * (f1 * height);
            const y1 = 0;
            const z1 = Math.cos(tilt) * (f1 * height);

            const x2 = Math.sin(tilt) * (f2 * height);
            const y2 = 0;
            const z2 = Math.cos(tilt) * (f2 * height);

            segList.push({
                x1, y1, z1,
                x2, y2, z2,
                radius: wireDiameter / 2,
                weight: adaptiveWeight(i, segments)
            });
        }

        const feedSegment = 0;

        let geometry = {
            type: "tilted-vertical",
            frequency,
            feedImpedance,
            groundType,
            segments: segList,
            feedSegment,
            feedVector: buildFeedVector(segList.length, feedSegment)
        };

        return BoostEngine.applyBoosts(this.config, geometry);
    }

    async calculate() {
        const geometry = this.buildGeometry();
        const { currents, impedance } = await this.solve(geometry);
        const pattern = await this.computePattern(currents, geometry);
        const swr = await this.computeSWR(impedance);

        return { impedance, currents, pattern, swr };
    }
}

function adaptiveWeight(i, N) {
    const center = 0;
    const dist = Math.abs(i - center);
    return 1 + 2 * Math.exp(-(dist * dist) / (N * 0.1));
}

function buildFeedVector(N, feedIndex) {
    const V = new Array(N).fill(0);
    V[feedIndex] = 1.0;
    return V;
}

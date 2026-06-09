/* ============================================================
   HF Antenna Designer — Tilted Dipole Engine
   NEC-Style Geometry + Adaptive Segmentation
   ============================================================ */

import BaseEngine from "/engines/engine-base.js";
import BoostEngine from "/engines/boost-engine.js";

export default class TiltedDipoleEngine extends BaseEngine {

    constructor(config) {
        super(config);
    }

    buildGeometry() {
        const {
            frequency,
            wireDiameter,
            totalLength,
            height,
            tiltAngleDeg,
            segments = 60,
            feedImpedance,
            groundType
        } = this.config;

        const tilt = (tiltAngleDeg * Math.PI) / 180;
        const half = totalLength / 2;

        const segList = [];

        for (let i = 0; i < segments; i++) {
            const f1 = i / segments;
            const f2 = (i + 1) / segments;

            const x1 = -half + f1 * totalLength;
            const x2 = -half + f2 * totalLength;

            const z1 = height + Math.sin(tilt) * (x1 / half);
            const z2 = height + Math.sin(tilt) * (x2 / half);

            segList.push({
                x1, y1: 0, z1,
                x2, y2: 0, z2,
                radius: wireDiameter / 2,
                weight: adaptiveWeight(i, segments)
            });
        }

        const feedSegment = Math.floor(segments / 2);

        let geometry = {
            type: "tilted-dipole",
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
    const center = N / 2;
    const dist = Math.abs(i - center);
    return 1 + 2 * Math.exp(-(dist * dist) / (N * 0.1));
}

function buildFeedVector(N, feedIndex) {
    const V = new Array(N).fill(0);
    V[feedIndex] = 1.0;
    return V;
}

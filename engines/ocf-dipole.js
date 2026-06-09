/* ============================================================
   HF Antenna Designer — OCF Dipole Engine
   NEC-Style Geometry + Adaptive Segmentation
   ============================================================ */

import BaseEngine from "/engines/engine-base.js";
import BoostEngine from "/engines/boost-engine.js";

export default class OCFDipoleEngine extends BaseEngine {

    constructor(config) {
        super(config);
    }

    buildGeometry() {
        const {
            frequency,
            wireDiameter,
            totalLength,
            height,
            offsetRatio = 0.33,
            segments = 80,
            feedImpedance,
            groundType
        } = this.config;

        const segList = [];
        const half = totalLength / 2;

        for (let i = 0; i < segments; i++) {
            const x1 = -half + (i / segments) * totalLength;
            const x2 = -half + ((i + 1) / segments) * totalLength;

            segList.push({
                x1, y1: 0, z1: height,
                x2, y2: 0, z2: height,
                radius: wireDiameter / 2,
                weight: adaptiveWeight(i, segments)
            });
        }

        const feedSegment = Math.floor(segments * offsetRatio);

        let geometry = {
            type: "ocf-dipole",
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
    const center = N * 0.33;
    const dist = Math.abs(i - center);
    return 1 + 2 * Math.exp(-(dist * dist) / (N * 0.1));
}

function buildFeedVector(N, feedIndex) {
    const V = new Array(N).fill(0);
    V[feedIndex] = 1.0;
    return V;
}

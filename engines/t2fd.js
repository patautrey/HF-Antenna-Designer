/* ============================================================
   HF Antenna Designer — T2FD Engine
   NEC-Style Geometry + Adaptive Segmentation
   ============================================================ */

import BaseEngine from "/engines/engine-base.js";
import BoostEngine from "/engines/boost-engine.js";

export default class T2FDEngine extends BaseEngine {

    constructor(config) {
        super(config);
    }

    buildGeometry() {
        const {
            frequency,
            wireDiameter,
            totalLength,
            spacing,
            height,
            terminationResistance,
            segments = 120,
            feedImpedance,
            groundType
        } = this.config;

        const segList = [];
        const half = totalLength / 2;

        /* Upper wire */
        for (let i = 0; i < segments / 2; i++) {
            const f1 = i / (segments / 2);
            const f2 = (i + 1) / (segments / 2);

            segList.push({
                x1: -half + f1 * totalLength,
                y1: 0,
                z1: height,
                x2: -half + f2 * totalLength,
                y2: 0,
                z2: height,
                radius: wireDiameter / 2,
                weight: adaptiveWeight(i, segments / 2)
            });
        }

        /* Lower wire */
        for (let i = 0; i < segments / 2; i++) {
            const f1 = i / (segments / 2);
            const f2 = (i + 1) / (segments / 2);

            segList.push({
                x1: -half + f1 * totalLength,
                y1: spacing,
                z1: height,
                x2: -half + f2 * totalLength,
                y2: spacing,
                z2: height,
                radius: wireDiameter / 2,
                weight: adaptiveWeight(i, segments / 2),
                load: i === segments / 2 - 1 ? { type: "resistor", resistance: terminationResistance } : null
            });
        }

        const feedSegment = Math.floor(segments / 4);

        let geometry = {
            type: "t2fd",
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
    const center = N / 4;
    const dist = Math.abs(i - center);
    return 1 + 2 * Math.exp(-(dist * dist) / (N * 0.1));
}

function buildFeedVector(N, feedIndex) {
    const V = new Array(N).fill(0);
    V[feedIndex] = 1.0;
    return V;
}

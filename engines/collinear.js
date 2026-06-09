/* ============================================================
   HF Antenna Designer — Collinear Vertical Engine
   NEC-Style Geometry + Adaptive Segmentation
   ============================================================ */

import BaseEngine from "/engines/engine-base.js";
import BoostEngine from "/engines/boost-engine.js";

export default class CollinearEngine extends BaseEngine {

    constructor(config) {
        super(config);
    }

    buildGeometry() {
        const {
            frequency,
            wireDiameter,
            elementLength,
            spacing,
            elementCount,
            baseHeight,
            segments = 100,
            feedImpedance,
            groundType
        } = this.config;

        const segList = [];
        let zBase = baseHeight;

        for (let e = 0; e < elementCount; e++) {
            for (let i = 0; i < segments; i++) {
                const f1 = i / segments;
                const f2 = (i + 1) / segments;

                const z1 = zBase + f1 * elementLength;
                const z2 = zBase + f2 * elementLength;

                segList.push({
                    x1: 0, y1: 0, z1,
                    x2: 0, y2: 0, z2,
                    radius: wireDiameter / 2,
                    weight: adaptiveWeight(i, segments)
                });
            }

            zBase += elementLength + spacing;
        }

        const feedSegment = 0;

        let geometry = {
            type: "collinear",
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
    const dist = Math.abs(i - 0);
    return 1 + 2 * Math.exp(-(dist * dist) / (N * 0.1));
}

function buildFeedVector(N, feedIndex) {
    const V = new Array(N).fill(0);
    V[feedIndex] = 1.0;
    return V;
}

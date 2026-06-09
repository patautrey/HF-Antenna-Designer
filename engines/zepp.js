/* ============================================================
   HF Antenna Designer — Zepp Antenna Engine
   NEC-Style Geometry + Adaptive Segmentation
   ============================================================ */

import BaseEngine from "/engines/engine-base.js";
import BoostEngine from "/engines/boost-engine.js";

export default class ZeppEngine extends BaseEngine {

    constructor(config) {
        super(config);
    }

    buildGeometry() {
        const {
            frequency,
            wireDiameter,
            radiatorLength,
            stubLength,
            height,
            segments = 80,
            feedImpedance,
            groundType
        } = this.config;

        const segList = [];

        /* Radiator */
        for (let i = 0; i < segments / 2; i++) {
            const f1 = i / (segments / 2);
            const f2 = (i + 1) / (segments / 2);

            segList.push({
                x1: f1 * radiatorLength,
                y1: 0,
                z1: height,
                x2: f2 * radiatorLength,
                y2: 0,
                z2: height,
                radius: wireDiameter / 2,
                weight: adaptiveWeight(i, segments / 2)
            });
        }

        /* Stub (vertical) */
        for (let i = 0; i < segments / 2; i++) {
            const f1 = i / (segments / 2);
            const f2 = (i + 1) / (segments / 2);

            segList.push({
                x1: 0,
                y1: 0,
                z1: height - f1 * stubLength,
                x2: 0,
                y2: 0,
                z2: height - f2 * stubLength,
                radius: wireDiameter / 2,
                weight: adaptiveWeight(i, segments / 2)
            });
        }

        const feedSegment = segments / 2; // bottom of stub

        let geometry = {
            type: "zepp",
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
